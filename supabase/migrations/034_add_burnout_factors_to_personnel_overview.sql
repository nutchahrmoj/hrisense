-- Migration 034: Expose burnout_factors + burnout_risk in v_personnel_overview
-- ============================================================================
-- The deployed personnel detail page reads (person).burnout_factors and
-- (person).burnout_risk directly from v_personnel_overview. burnout_factors did
-- not exist on the view, so the burnout breakdown section was always hidden
-- (the page does `if (!bf) return null`). This adds the field so the section
-- renders without a code redeploy.
--
-- burnout_factors: JSON of the latest year's behavioral inputs from
-- personnel_burnout_factors (LATERAL LIMIT 1 to keep one row per person).
-- burnout_risk: calculated via calculate_burnout_risk (same function
-- v_burnout_analysis uses) so the score matches the 6 displayed factor bars;
-- falls back to personnel_risk_scores.burnout_risk when no factors exist.
--
-- Forward-compatible: the in-progress local code that merges burnout from
-- v_burnout_analysis keeps working (same underlying data).

CREATE OR REPLACE VIEW v_personnel_overview AS
SELECT
  p.id,
  p.citizen_id,
  p.employee_number,
  p.prefix_th,
  p.first_name_th,
  p.last_name_th,
  (COALESCE(p.prefix_th, '') || p.first_name_th || ' ' || p.last_name_th) AS full_name_th,
  p.prefix_en,
  p.first_name_en,
  p.last_name_en,
  (COALESCE(p.prefix_en, '') || COALESCE(p.first_name_en, '') || ' ' || COALESCE(p.last_name_en, '')) AS full_name_en,
  p.birth_date,
  p.birth_date_be,
  p.government_start_date,
  p.position_appointment_date,
  p.retirement_date,
  p.retirement_years_remaining,
  p.organization_id,
  o.name_th AS organization_name,
  o.abbreviation_th AS org_abbreviation,
  o.level AS org_level,
  o.parent_id AS parent_org_id,
  p.current_position_id,
  pos.name_th AS position_name,
  pos.position_code,
  pos.is_critical AS is_critical_position,
  pt.name_th AS position_type,
  pt.code AS position_type_code,
  pl.name_th AS position_level,
  pl.c_level,
  pf.name_th AS position_family,
  p.salary,
  p.salary_step,
  p.education_level,
  p.degree_name,
  p.university,
  p.major,
  p.email,
  p.mobile,
  p.status,
  p.gender,
  p.overall_risk_score,
  p.risk_level,
  prs.retirement_risk,
  prs.transfer_risk,
  prs.talent_loss_risk,
  prs.vacancy_risk,
  prs.succession_risk,
  CASE WHEN pbf.personnel_id IS NOT NULL
       THEN calculate_burnout_risk(p.id, pbf.year)::numeric(5,2)
       ELSE prs.burnout_risk
  END AS burnout_risk,
  CASE WHEN pbf.personnel_id IS NOT NULL THEN jsonb_build_object(
    'late_days_ytd', pbf.late_days_ytd,
    'absent_days_ytd', pbf.absent_days_ytd,
    'performance_score', pbf.performance_score,
    'overtime_hours_ytd', pbf.overtime_hours_ytd,
    'training_hours_ytd', pbf.training_hours_ytd,
    'workload_index', pbf.workload_index
  ) END AS burnout_factors
FROM personnel p
JOIN organizations o ON o.id = p.organization_id
LEFT JOIN positions pos ON pos.id = p.current_position_id
LEFT JOIN position_types pt ON pt.id = p.position_type_id
LEFT JOIN position_levels pl ON pl.id = p.position_level_id
LEFT JOIN position_families pf ON pf.id = p.position_family_id
LEFT JOIN personnel_risk_scores prs ON prs.personnel_id = p.id
LEFT JOIN LATERAL (
  SELECT * FROM personnel_burnout_factors
  WHERE personnel_id = p.id
  ORDER BY year DESC, assessed_at DESC
  LIMIT 1
) pbf ON true;

ALTER VIEW v_personnel_overview SET (security_invoker = true);
