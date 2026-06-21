-- ============================================================================
-- HRiSENSE Migration 022: Close PII exposure (CRITICAL C1)
--
-- Fixes the unauthenticated PII leak documented in docs/SECURITY_AUDIT.md:
--   - Views were SECURITY DEFINER by default -> bypassed RLS on base tables.
--   - Migration 019 granted SELECT on ALL tables/views to the `anon` role,
--     so `GET /rest/v1/v_personnel_overview` with the public anon key returned
--     every personnel row (citizen_id, salary, ...) with no authentication.
--
-- This migration enforces RLS at the view layer and removes anon access.
-- Requires PostgreSQL 15+ (Supabase) for `security_invoker`.
-- ============================================================================

-- 1) Make every view in `public` evaluate RLS using the CALLER's credentials
--    instead of the view owner's. Applied to all views so none are missed.
DO $$
DECLARE
  v record;
BEGIN
  FOR v IN
    SELECT viewname FROM pg_views WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER VIEW public.%I SET (security_invoker = on);', v.viewname);
  END LOOP;
END $$;

-- 2) Revoke the blanket grants given to the unauthenticated `anon` role in 019.
--    An HR system has no public/unauthenticated data surface.
REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- 3) Keep `authenticated` access. The app's request-scoped client authenticates
--    as `authenticated`; row visibility is now governed by the RLS policies in
--    009_rls_policies.sql (which the views finally respect after step 1).
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- NOTE (follow-ups tracked in docs/SECURITY_AUDIT.md, not in this migration):
--   * Mask citizen_id / salary in v_personnel_overview for non-admin roles (H1).
--   * Fix `organization_id IS NULL` cross-tenant policy gaps (C6).
--   * Wrap RLS helper calls in (SELECT ...) to avoid per-row evaluation (C7).
