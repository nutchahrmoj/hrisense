-- Migration 025: Set security_invoker on all views to honor RLS
-- Addresses Issue #32 / PR #37 — closes cross-tenant access gap via security_definer default views

ALTER VIEW v_personnel_overview SET (security_invoker = true);
ALTER VIEW v_org_dashboard SET (security_invoker = true);
ALTER VIEW v_retirement_timeline SET (security_invoker = true);
ALTER VIEW v_vacancy_analysis SET (security_invoker = true);
ALTER VIEW v_high_risk_personnel SET (security_invoker = true);
ALTER VIEW v_succession_status SET (security_invoker = true);
ALTER VIEW v_training_summary SET (security_invoker = true);
ALTER VIEW v_evaluation_history SET (security_invoker = true);
ALTER VIEW v_active_alerts SET (security_invoker = true);
ALTER VIEW v_workforce_composition SET (security_invoker = true);
ALTER VIEW v_import_status SET (security_invoker = true);

ALTER VIEW v_critical_positions SET (security_invoker = true);
ALTER VIEW v_succession_candidates SET (security_invoker = true);
ALTER VIEW v_risk_distribution SET (security_invoker = true);
ALTER VIEW v_org_risk_details SET (security_invoker = true);
ALTER VIEW v_idp_summary SET (security_invoker = true);
ALTER VIEW v_training_records SET (security_invoker = true);
ALTER VIEW v_high_potential_personnel SET (security_invoker = true);
ALTER VIEW v_org_vacancy_summary SET (security_invoker = true);
ALTER VIEW v_critical_vacancies SET (security_invoker = true);

ALTER VIEW v_burnout_analysis SET (security_invoker = true);
ALTER VIEW v_org_burnout_summary SET (security_invoker = true);
