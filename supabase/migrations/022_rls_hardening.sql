-- ============================================================================
-- Migration 022: RLS Hardening — Revoke broad anon grants, add table-specific
-- Addresses Issue #32 / PR #22, #24 — C1 (service role bypass) + H4 (broad grants)
-- ============================================================================

-- 1. Revoke the overly-broad grants from migration 019
REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- 2. Grant anon SELECT only on tables that genuinely need public/unauthenticated access
--    (Currently none — all data requires authentication)
-- GRANT SELECT ON <public_table> TO anon;  -- add here if needed

-- 3. Ensure authenticated role has access to all tables (RLS will scope the data)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. Ensure service_role retains full access (for admin operations, migrations, cron jobs)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 5. Verify RLS is enabled on all user-data tables
-- (Most are already done in migration 009, but let's ensure nothing was missed)
ALTER TABLE IF EXISTS personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS personnel_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organization_risk_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workforce_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS retirement_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS succession_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS succession_plan_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS individual_development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workforce_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS performance_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leave_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transfer_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS data_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS import_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS import_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS salary_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS risk_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS position_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS position_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS position_families ENABLE ROW LEVEL SECURITY;

COMMENT ON SCHEMA public IS 'RLS hardened: broad anon grants revoked 2026-06-22 (migration 022)';
