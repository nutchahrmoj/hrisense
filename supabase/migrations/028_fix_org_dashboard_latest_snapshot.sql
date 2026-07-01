-- Migration 028: Fix v_org_dashboard to join on the latest snapshot instead of hardcoded CURRENT_DATE
-- This prevents the dashboard from going completely blank/null when a new day starts.

CREATE OR REPLACE VIEW v_org_dashboard AS
SELECT
  o.id AS organization_id,
  o.org_code,
  o.name_th,
  o.abbreviation_th,
  o.level AS org_level,
  o.parent_id,
  COALESCE(parent_o.name_th, '') AS parent_org_name,
  -- Headcount
  ors.total_personnel,
  ors.total_quota,
  ors.vacancy_count,
  ors.vacancy_rate,
  -- Risk
  ors.overall_risk_score,
  ors.risk_level,
  ors.avg_retirement_risk,
  ors.avg_transfer_risk,
  ors.avg_talent_risk,
  -- Retirement
  ors.retirements_1yr,
  ors.retirements_3yr,
  ors.retirements_5yr,
  ors.retirement_rate_3yr,
  -- Succession
  ors.critical_positions,
  ors.positions_without_successor,
  ors.succession_coverage_rate,
  -- Computed
  ors.snapshot_date,
  ors.computed_at
FROM organizations o
LEFT JOIN LATERAL (
  SELECT * FROM organization_risk_summary
  WHERE organization_id = o.id
  ORDER BY snapshot_date DESC, computed_at DESC
  LIMIT 1
) ors ON true
LEFT JOIN organizations parent_o ON parent_o.id = o.parent_id
WHERE o.is_active = true;

ALTER VIEW v_org_dashboard SET (security_invoker = true);
