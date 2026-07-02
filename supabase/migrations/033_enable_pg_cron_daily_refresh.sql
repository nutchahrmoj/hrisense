-- Migration 033: Enable pg_cron + schedule daily snapshot refresh
-- ============================================================================
-- Without a daily refresh, organization_risk_summary is frozen at the last
-- manual recompute (the dashboard still works thanks to migration 028's
-- "latest snapshot" join, but the data goes stale). pg_cron runs a background
-- job at 18:07 UTC (~01:07 ICT) every day that recomputes every active org's
-- snapshot via calculate_org_risk_summary (migration 030). The function upserts
-- on (organization_id, snapshot_date), so it is safe to re-run.
--
-- Requires pg_cron in shared_preload_libraries (Supabase enables this when the
-- extension is installed). The jobs table is `cron.job` (singular) in pg_cron 1.6+.

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'refresh-org-risk-snapshots',
  '7 18 * * *',
  $$SELECT count(*) FROM (SELECT calculate_org_risk_summary(id) FROM organizations WHERE is_active = true) x$$
);
