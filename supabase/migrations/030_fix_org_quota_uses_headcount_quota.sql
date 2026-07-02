-- Migration 030: Fix total_quota to use organizations.headcount_quota
-- ============================================================================
-- Problem: calculate_org_risk_summary() derived total_quota from SUM(positions.quota),
-- but the seed set most positions to quota=1 (e.g. one position title holding 24 staff),
-- so the dashboard reported an authorized strength of ~215 for a ministry that is
-- actually authorized for 1,600 (sum of the 17 divisions' headcount_quota). This also
-- made vacancy collapse to ~0 and hid the real understaffing risk.
--
-- Fix: total_quota now reads organizations.headcount_quota, the authoritative
-- authorized-strength field. Parent containers (ministry/department) contribute 0
-- because their headcount_quota is a rollup of children — summing it alongside the
-- children would double-count. This mirrors total_personnel, which is also 0 at the
-- container levels, so the dashboard grand total equals the operational-division sum.
--
-- NOTE: This migration only changes the function definition. It does NOT recompute
-- existing snapshots — run after applying:
--   SELECT calculate_org_risk_summary(id) FROM organizations WHERE is_active = true;
-- That inserts a snapshot for snapshot_date = CURRENT_DATE.
--
-- Side effect: because vacancy_rate is now real (high for understaffed orgs), the
-- weighted overall_risk_score rises, so many divisions correctly move to 'red'.
--
-- Also: there is no daily refresh job (pg_cron not installed). Snapshots stay frozen
-- at the date they were computed; v_org_dashboard (migration 028) surfaces the latest
-- one so the dashboard never goes blank. Consider adding a daily refresh.

CREATE OR REPLACE FUNCTION calculate_org_risk_summary(p_org_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_total_personnel INTEGER;
  v_total_quota INTEGER;
  v_total_positions INTEGER;
  v_vacancy_count INTEGER;
  v_vacancy_rate NUMERIC(5,2);
  v_retirements_1yr INTEGER;
  v_retirements_3yr INTEGER;
  v_retirements_5yr INTEGER;
  v_avg_retirement NUMERIC(5,2);
  v_avg_transfer NUMERIC(5,2);
  v_avg_talent NUMERIC(5,2);
  v_overall NUMERIC(5,2);
  v_risk_level risk_level;
  v_critical_positions INTEGER;
  v_no_successor INTEGER;
  v_result JSONB;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Headcount metrics
  SELECT COUNT(*) INTO v_total_personnel
  FROM personnel WHERE organization_id = p_org_id AND status = 'active';

  -- Authorized strength for THIS org's own level: leaf orgs use headcount_quota;
  -- parent containers contribute 0 (rollup would double-count). See migration header.
  SELECT COALESCE(
    (SELECT CASE WHEN EXISTS (
          SELECT 1 FROM organizations ch
          WHERE ch.parent_id = o.id AND ch.is_active = true
       ) THEN 0 ELSE o.headcount_quota END
     FROM organizations o WHERE o.id = p_org_id), 0)
  INTO v_total_quota;

  SELECT COUNT(*) INTO v_total_positions
  FROM positions WHERE organization_id = p_org_id AND is_active = true;

  SELECT v_total_quota - v_total_personnel INTO v_vacancy_count;
  v_vacancy_count := GREATEST(v_vacancy_count, 0);

  IF v_total_quota > 0 THEN
    v_vacancy_rate := ROUND((v_vacancy_count::NUMERIC / v_total_quota) * 100, 2);
  ELSE
    v_vacancy_rate := 0;
  END IF;

  -- Retirement forecasts
  SELECT
    COUNT(*) FILTER (WHERE retirement_date <= v_today + INTERVAL '1 year'),
    COUNT(*) FILTER (WHERE retirement_date <= v_today + INTERVAL '3 years'),
    COUNT(*) FILTER (WHERE retirement_date <= v_today + INTERVAL '5 years')
  INTO v_retirements_1yr, v_retirements_3yr, v_retirements_5yr
  FROM personnel
  WHERE organization_id = p_org_id AND status = 'active';

  -- Average risk scores from personnel_risk_scores
  SELECT
    COALESCE(AVG(retirement_risk), 0),
    COALESCE(AVG(transfer_risk), 0),
    COALESCE(AVG(talent_loss_risk), 0)
  INTO v_avg_retirement, v_avg_transfer, v_avg_talent
  FROM personnel_risk_scores prs
  JOIN personnel p ON p.id = prs.personnel_id
  WHERE p.organization_id = p_org_id AND p.status = 'active';

  -- Succession coverage
  SELECT COUNT(*) INTO v_critical_positions
  FROM positions
  WHERE organization_id = p_org_id AND is_critical = true AND is_active = true;

  SELECT COUNT(*) INTO v_no_successor
  FROM positions pos
  WHERE pos.organization_id = p_org_id AND pos.is_critical = true AND pos.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM succession_plans sp
    JOIN succession_plan_candidates spc ON spc.succession_plan_id = sp.id
    WHERE sp.position_id = pos.id AND spc.readiness IN ('ready_now', 'ready_1_2_years')
  );

  -- Overall org risk (weighted composite)
  v_overall := (
    v_avg_retirement * 0.25 +
    v_avg_transfer * 0.10 +
    v_avg_talent * 0.20 +
    LEAST(v_vacancy_rate * 2, 100) * 0.15 +
    CASE WHEN v_critical_positions > 0
      THEN (v_no_successor::NUMERIC / v_critical_positions) * 100
      ELSE 0
    END * 0.30
  );

  IF v_overall >= 75 THEN v_risk_level := 'critical';
  ELSIF v_overall >= 50 THEN v_risk_level := 'red';
  ELSIF v_overall >= 25 THEN v_risk_level := 'amber';
  ELSE v_risk_level := 'green';
  END IF;

  -- Upsert org risk summary
  INSERT INTO organization_risk_summary (
    organization_id, total_personnel, total_positions, total_quota,
    vacancy_count, vacancy_rate, retirements_1yr, retirements_3yr,
    retirements_5yr, avg_retirement_risk, avg_transfer_risk,
    avg_talent_risk, overall_risk_score, risk_level,
    critical_positions, positions_without_successor,
    computed_at
  ) VALUES (
    p_org_id, v_total_personnel, v_total_positions, v_total_quota,
    v_vacancy_count, v_vacancy_rate, v_retirements_1yr, v_retirements_3yr,
    v_retirements_5yr, v_avg_retirement, v_avg_transfer,
    v_avg_talent, v_overall, v_risk_level,
    v_critical_positions, v_no_successor,
    NOW()
  )
  ON CONFLICT (organization_id, snapshot_date) DO UPDATE SET
    total_personnel = EXCLUDED.total_personnel,
    total_positions = EXCLUDED.total_positions,
    total_quota = EXCLUDED.total_quota,
    vacancy_count = EXCLUDED.vacancy_count,
    vacancy_rate = EXCLUDED.vacancy_rate,
    retirements_1yr = EXCLUDED.retirements_1yr,
    retirements_3yr = EXCLUDED.retirements_3yr,
    retirements_5yr = EXCLUDED.retirements_5yr,
    avg_retirement_risk = EXCLUDED.avg_retirement_risk,
    avg_transfer_risk = EXCLUDED.avg_transfer_risk,
    avg_talent_risk = EXCLUDED.avg_talent_risk,
    overall_risk_score = EXCLUDED.overall_risk_score,
    risk_level = EXCLUDED.risk_level,
    critical_positions = EXCLUDED.critical_positions,
    positions_without_successor = EXCLUDED.positions_without_successor,
    computed_at = NOW(),
    updated_at = NOW();

  v_result := jsonb_build_object(
    'organization_id', p_org_id,
    'total_personnel', v_total_personnel,
    'total_quota', v_total_quota,
    'vacancy_count', v_vacancy_count,
    'vacancy_rate', v_vacancy_rate,
    'retirements_1yr', v_retirements_1yr,
    'retirements_3yr', v_retirements_3yr,
    'retirements_5yr', v_retirements_5yr,
    'overall_risk_score', v_overall,
    'risk_level', v_risk_level,
    'critical_positions', v_critical_positions,
    'positions_without_successor', v_no_successor
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
