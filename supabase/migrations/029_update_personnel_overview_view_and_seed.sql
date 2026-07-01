-- Migration 029: Update Personnel Overview View and Comprehensive Seed Data
-- Recreates v_personnel_overview to include burnout_risk
-- Seeds positions, evaluations, trainings, IDPs, succession plans, transfers, leaves, rules, and alerts
-- Enforces risk level distribution (green, amber, red, critical) across all divisions

-- 1. Update v_personnel_overview view to include burnout_risk column
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
  -- Organization
  p.organization_id,
  o.name_th AS organization_name,
  o.abbreviation_th AS org_abbreviation,
  o.level AS org_level,
  o.parent_id AS parent_org_id,
  -- Position
  p.current_position_id,
  pos.name_th AS position_name,
  pos.position_code,
  pos.is_critical AS is_critical_position,
  -- Classification
  pt.name_th AS position_type,
  pt.code AS position_type_code,
  pl.name_th AS position_level,
  pl.c_level,
  pf.name_th AS position_family,
  -- Employment
  p.salary,
  p.salary_step,
  -- Education
  p.education_level,
  p.degree_name,
  p.university,
  p.major,
  -- Contact
  p.email,
  p.mobile,
  -- Status
  p.status,
  p.gender,
  -- Risk
  p.overall_risk_score,
  p.risk_level,
  prs.retirement_risk,
  prs.transfer_risk,
  prs.talent_loss_risk,
  prs.vacancy_risk,
  prs.succession_risk,
  prs.burnout_risk -- Added burnout_risk column
FROM personnel p
JOIN organizations o ON o.id = p.organization_id
LEFT JOIN positions pos ON pos.id = p.current_position_id
LEFT JOIN position_types pt ON pt.id = p.position_type_id
LEFT JOIN position_levels pl ON pl.id = p.position_level_id
LEFT JOIN position_families pf ON pf.id = p.position_family_id
LEFT JOIN personnel_risk_scores prs ON prs.personnel_id = p.id;

ALTER VIEW v_personnel_overview SET (security_invoker = true);

-- 2. Clear any existing seed records to ensure clean state
TRUNCATE TABLE alerts CASCADE;
TRUNCATE TABLE alert_rules CASCADE;
TRUNCATE TABLE succession_plan_candidates CASCADE;
TRUNCATE TABLE succession_plans CASCADE;
TRUNCATE TABLE individual_development_plans CASCADE;
TRUNCATE TABLE training_records CASCADE;
TRUNCATE TABLE performance_evaluations CASCADE;
TRUNCATE TABLE leave_records CASCADE;
TRUNCATE TABLE transfer_records CASCADE;
TRUNCATE TABLE workforce_allocations CASCADE;

-- We temporary drop the foreign key or set current_position_id to NULL to allow positions truncation
UPDATE personnel SET current_position_id = NULL;
TRUNCATE TABLE positions CASCADE;

-- 3. Run comprehensive PL/pgSQL seed block
DO $$
DECLARE
  v_org RECORD;
  v_pos_name VARCHAR(500);
  v_pos_code VARCHAR(100);
  v_pos_id UUID;
  v_pos_idx INTEGER := 1;
  v_personnel RECORD;
  v_cand RECORD;
  v_emp_count INTEGER := 0;
  v_level_id UUID;
  v_type_id UUID := 'b0000001-0000-0000-0000-000000000003'; -- ACAD
  v_family_id UUID;
  
  -- UUIDs for levels
  v_lvl_expert UUID := 'c0000001-0000-0000-0000-000000000008'; -- เชี่ยวชาญ
  v_lvl_senior UUID := 'c0000001-0000-0000-0000-000000000009'; -- ชำนาญการพิเศษ
  v_lvl_pro UUID    := 'c0000001-0000-0000-0000-000000000010'; -- ชำนาญการ
  v_lvl_pract UUID  := 'c0000001-0000-0000-0000-000000000011'; -- ปฏิบัติการ

  -- Specific IDs
  v_p1 UUID;
  v_p2 UUID;
  v_p3 UUID;
  v_p4 UUID;
  v_plan_id UUID;
  v_rule_id UUID;
BEGIN
  -- A. Create Positions for each division
  FOR v_org IN
    SELECT id, abbreviation_th, name_th FROM organizations WHERE level = 'division' AND is_active = true
  LOOP
    -- Base position names
    v_pos_name := CASE
      WHEN v_org.abbreviation_th = 'กก.' THEN 'นักบริหารงานทั่วไป'
      WHEN v_org.abbreviation_th = 'กบค.' THEN 'นักทรัพยากรบุคคล'
      WHEN v_org.abbreviation_th = 'กบค.คลัง' OR v_org.name_th LIKE '%คลัง%' THEN 'นักวิชาการเงินและบัญชี'
      WHEN v_org.abbreviation_th = 'กตท.' THEN 'นักการต่างประเทศ'
      WHEN v_org.abbreviation_th = 'กอศ.' THEN 'วิศวกรโยธา'
      WHEN v_org.abbreviation_th = 'ศทส.' THEN 'นักวิชาการคอมพิวเตอร์'
      WHEN v_org.abbreviation_th = 'กกด.' THEN 'นิติกร'
      WHEN v_org.abbreviation_th = 'กยผ.' THEN 'นักวิเคราะห์นโยบายและแผน'
      WHEN v_org.abbreviation_th = 'สบย.' THEN 'นักพัฒนาบุคลากร'
      WHEN v_org.abbreviation_th = 'กตภ.' THEN 'นักตรวจสอบภายใน'
      WHEN v_org.abbreviation_th = 'กพบ.' THEN 'นักวิเคราะห์นโยบายและแผน'
      WHEN v_org.abbreviation_th = 'กพน.' THEN 'นักพัฒนานวัตกรรม'
      WHEN v_org.abbreviation_th = 'ศปท.' THEN 'นักสืบสวนสอบสวน'
      WHEN v_org.abbreviation_th = 'ศบร.' THEN 'เจ้าหน้าที่บริการประชาชน'
      WHEN v_org.abbreviation_th = 'สกย.' THEN 'นักบริหารกองทุน'
      WHEN v_org.abbreviation_th = 'กปย.' THEN 'นักบริหารงานทั่วไป'
      ELSE 'นักวิเคราะห์นโยบายและแผน'
    END;

    v_family_id := CASE
      WHEN v_pos_name = 'นิติกร' THEN 'd0000001-0000-0000-0000-000000000001'::UUID
      WHEN v_pos_name = 'นักวิชาการเงินและบัญชี' THEN 'd0000001-0000-0000-0000-000000000002'::UUID
      WHEN v_pos_name = 'นักวิชาการคอมพิวเตอร์' THEN 'd0000001-0000-0000-0000-000000000003'::UUID
      WHEN v_pos_name = 'นักทรัพยากรบุคคล' THEN 'd0000001-0000-0000-0000-000000000005'::UUID
      ELSE 'd0000001-0000-0000-0000-000000000004'::UUID
    END;

    -- Create 5 positions for this division:
    -- Position 1: เชี่ยวชาญ (Critical)
    INSERT INTO positions (position_code, name_th, organization_id, position_type_id, position_level_id, position_family_id, quota, current_occupancy, is_critical)
    VALUES (v_org.abbreviation_th || '-EX-001', v_pos_name || 'เชี่ยวชาญ', v_org.id, v_type_id, v_lvl_expert, v_family_id, 1, 0, true)
    RETURNING id INTO v_pos_id;

    -- Position 2: ชำนาญการพิเศษ (Critical)
    INSERT INTO positions (position_code, name_th, organization_id, position_type_id, position_level_id, position_family_id, quota, current_occupancy, is_critical)
    VALUES (v_org.abbreviation_th || '-SP-001', v_pos_name || 'ชำนาญการพิเศษ', v_org.id, v_type_id, v_lvl_senior, v_family_id, 2, 0, true);

    -- Position 3: ชำนาญการ 1
    INSERT INTO positions (position_code, name_th, organization_id, position_type_id, position_level_id, position_family_id, quota, current_occupancy, is_critical)
    VALUES (v_org.abbreviation_th || '-PRO-001', v_pos_name || 'ชำนาญการ', v_org.id, v_type_id, v_lvl_pro, v_family_id, 4, 0, false);

    -- Position 4: ชำนาญการ 2
    INSERT INTO positions (position_code, name_th, organization_id, position_type_id, position_level_id, position_family_id, quota, current_occupancy, is_critical)
    VALUES (v_org.abbreviation_th || '-PRO-002', v_pos_name || 'ชำนาญการ (สำรอง)', v_org.id, v_type_id, v_lvl_pro, v_family_id, 2, 0, false);

    -- Position 5: ปฏิบัติการ
    INSERT INTO positions (position_code, name_th, organization_id, position_type_id, position_level_id, position_family_id, quota, current_occupancy, is_critical)
    VALUES (v_org.abbreviation_th ||  '-PRC-001', v_pos_name || 'ปฏิบัติการ', v_org.id, v_type_id, v_lvl_pract, v_family_id, 5, 0, false);

  END LOOP;

  -- B. Link Personnel to Positions & Create Allocations
  FOR v_org IN
    SELECT id, abbreviation_th FROM organizations WHERE level = 'division' AND is_active = true
  LOOP
    v_pos_idx := 1;
    FOR v_personnel IN
      SELECT p.id, p.position_level_id
      FROM personnel p
      WHERE p.organization_id = v_org.id AND p.status = 'active'
      ORDER BY p.birth_date ASC
    LOOP
      SELECT id INTO v_pos_id
      FROM positions
      WHERE organization_id = v_org.id
      AND position_level_id = v_personnel.position_level_id
      LIMIT 1;

      IF v_pos_id IS NULL THEN
        SELECT id INTO v_pos_id
        FROM positions
        WHERE organization_id = v_org.id
        ORDER BY RANDOM()
        LIMIT 1;
      END IF;

      UPDATE personnel SET current_position_id = v_pos_id WHERE id = v_personnel.id;

      INSERT INTO workforce_allocations (personnel_id, position_id, effective_date, is_current, assignment_type)
      VALUES (v_personnel.id, v_pos_id, CURRENT_DATE - INTERVAL '2 years', true, 'permanent');

    END LOOP;
  END LOOP;

  -- C. Enforce Risk Distribution
  FOR v_org IN
    SELECT id FROM organizations WHERE level = 'division' AND is_active = true
  LOOP
    SELECT id INTO v_p1 FROM personnel WHERE organization_id = v_org.id AND status = 'active' ORDER BY birth_date ASC LIMIT 1;
    SELECT id INTO v_p2 FROM personnel WHERE organization_id = v_org.id AND status = 'active' AND id != v_p1 ORDER BY birth_date ASC LIMIT 1;
    SELECT id INTO v_p3 FROM personnel WHERE organization_id = v_org.id AND status = 'active' AND id NOT IN (v_p1, v_p2) ORDER BY birth_date DESC LIMIT 1;
    SELECT id INTO v_p4 FROM personnel WHERE organization_id = v_org.id AND status = 'active' AND id NOT IN (v_p1, v_p2, v_p3) ORDER BY birth_date DESC LIMIT 1;

    IF v_p1 IS NOT NULL AND v_p2 IS NOT NULL AND v_p3 IS NOT NULL AND v_p4 IS NOT NULL THEN
      
      -- A. Personnel 1: CRITICAL RISK
      UPDATE personnel
      SET birth_date = CURRENT_DATE - INTERVAL '59 years' - INTERVAL '5 months',
          gpa = 3.90, education_level = 'masters', degree_name = 'วิทยาศาสตรมหาบัณฑิต'
      WHERE id = v_p1;

      UPDATE positions
      SET is_critical = true, quota = 1
      WHERE id = (SELECT current_position_id FROM personnel WHERE id = v_p1);

      INSERT INTO transfer_records (personnel_id, source_organization_id, target_organization_id, effective_date, reason)
      VALUES 
        (v_p1, v_org.id, v_org.id, CURRENT_DATE - INTERVAL '1 year', 'หมุนเวียน'),
        (v_p1, v_org.id, v_org.id, CURRENT_DATE - INTERVAL '2 years', 'หมุนเวียน'),
        (v_p1, v_org.id, v_org.id, CURRENT_DATE - INTERVAL '3 years', 'หมุนเวียน'),
        (v_p1, v_org.id, v_org.id, CURRENT_DATE - INTERVAL '4 years', 'หมุนเวียน'),
        (v_p1, v_org.id, v_org.id, CURRENT_DATE - INTERVAL '4 years 6 months', 'หมุนเวียน'),
        (v_p1, v_org.id, v_org.id, CURRENT_DATE - INTERVAL '5 years', 'หมุนเวียน');

      INSERT INTO performance_evaluations (personnel_id, evaluation_year, evaluation_period, overall_score, rating, evaluation_date)
      VALUES 
        (v_p1, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, '1', 92.5, 'outstanding', CURRENT_DATE - INTERVAL '3 months'),
        (v_p1, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - 1, '2', 91.0, 'outstanding', CURRENT_DATE - INTERVAL '9 months');

      FOR i IN 1..8 LOOP
        INSERT INTO individual_development_plans (personnel_id, plan_name, plan_year, plan_status, goal_description, start_date, target_completion_date, progress_percentage)
        VALUES (v_p1, 'พัฒนาทักษะเฉพาะด้าน ' || i, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER + 543, 'in_progress', 'เป้าหมาย ' || i, CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE - INTERVAL '1 month', 10);
      END LOOP;

      -- B. Personnel 2: RED RISK
      UPDATE personnel
      SET birth_date = CURRENT_DATE - INTERVAL '56 years' - INTERVAL '4 months',
          education_level = 'bachelors', degree_name = 'ศิลปศาสตรบัณฑิต'
      WHERE id = v_p2;

      UPDATE positions
      SET is_critical = true, quota = 1
      WHERE id = (SELECT current_position_id FROM personnel WHERE id = v_p2);

      INSERT INTO transfer_records (personnel_id, source_organization_id, target_organization_id, effective_date, reason)
      VALUES 
        (v_p2, v_org.id, v_org.id, CURRENT_DATE - INTERVAL '1 year', 'หมุนเวียน'),
        (v_p2, v_org.id, v_org.id, CURRENT_DATE - INTERVAL '2 years', 'หมุนเวียน'),
        (v_p2, v_org.id, v_org.id, CURRENT_DATE - INTERVAL '3 years', 'หมุนเวียน');

      FOR i IN 1..3 LOOP
        INSERT INTO individual_development_plans (personnel_id, plan_name, plan_year, plan_status, goal_description, start_date, target_completion_date, progress_percentage)
        VALUES (v_p2, 'พัฒนาแผนงาน ' || i, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER + 543, 'in_progress', 'กิจกรรม ' || i, CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE - INTERVAL '1 month', 30);
      END LOOP;

      -- C. Personnel 3: AMBER RISK
      UPDATE personnel
      SET birth_date = CURRENT_DATE - INTERVAL '52 years' - INTERVAL '2 months',
          education_level = 'bachelors', degree_name = 'ศิลปศาสตรบัณฑิต'
      WHERE id = v_p3;

      UPDATE positions
      SET is_critical = false
      WHERE id = (SELECT current_position_id FROM personnel WHERE id = v_p3);

      INSERT INTO transfer_records (personnel_id, source_organization_id, target_organization_id, effective_date, reason)
      VALUES (v_p3, v_org.id, v_org.id, CURRENT_DATE - INTERVAL '2 years', 'ช่วยราชการ');

      FOR i IN 1..2 LOOP
        INSERT INTO individual_development_plans (personnel_id, plan_name, plan_year, plan_status, goal_description, start_date, target_completion_date, progress_percentage)
        VALUES (v_p3, 'พัฒนาสายงาน ' || i, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER + 543, 'in_progress', 'กิจกรรม ' || i, CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE - INTERVAL '1 month', 40);
      END LOOP;

      -- D. Personnel 4: GREEN RISK
      UPDATE personnel
      SET birth_date = CURRENT_DATE - INTERVAL '28 years' - INTERVAL '6 months',
          education_level = 'bachelors', degree_name = 'ศิลปศาสตรบัณฑิต'
      WHERE id = v_p4;

      UPDATE positions
      SET is_critical = false
      WHERE id = (SELECT current_position_id FROM personnel WHERE id = v_p4);

    END IF;
  END LOOP;

  -- D. Seed training records
  FOR v_personnel IN
    SELECT id, full_name_th FROM v_personnel_overview LIMIT 150
  LOOP
    INSERT INTO training_records (personnel_id, course_name, training_provider, training_type, start_date, end_date, duration_hours, is_completed, cost)
    VALUES (v_personnel.id, 'จริยธรรมข้าราชการพลเรือน', 'สำนักงาน ก.พ.', 'ทั่วไป', CURRENT_DATE - INTERVAL '4 months', CURRENT_DATE - INTERVAL '4 months' + INTERVAL '3 days', 18, true, 4000);
  END LOOP;

  FOR v_cand IN
    SELECT id FROM personnel LIMIT 5
  LOOP
    INSERT INTO training_records (personnel_id, course_name, training_provider, training_type, start_date, end_date, duration_hours, is_completed, cost, certificate_number)
    VALUES 
      (v_cand.id, 'HR Management Modernization', 'สำนักงาน ก.พ.', 'บริหาร', '2026-04-10', '2026-04-12', 24, true, 12000, 'CERT-2026-002'),
      (v_cand.id, 'Cloud Architecture Fundamentals', 'AWS Thailand', 'เทคโนโลยี', '2026-02-15', '2026-02-20', 48, true, 35000, 'CERT-2026-003'),
      (v_cand.id, 'Cybersecurity Essentials', 'ETDA', 'เทคโนโลยี', '2026-05-01', '2026-05-03', 16, false, 8000, NULL);
  END LOOP;

  -- Add the LATEST training course (June 2026) requested in Requirement 4
  FOR v_cand IN
    SELECT id FROM personnel LIMIT 3
  LOOP
    INSERT INTO training_records (personnel_id, course_name, training_provider, training_type, start_date, end_date, duration_hours, is_completed, cost, certificate_number)
    VALUES (v_cand.id, 'การประยุกต์ใช้ AI และธรรมาภิบาลข้อมูลในงานยุติธรรม', 'สถาบันพัฒนาข้าราชการ', 'เทคโนโลยี', '2026-06-15', '2026-06-18', 32, true, 15000, 'CERT-2026-009');
  END LOOP;

  -- E. Seed Succession Plans
  FOR v_org IN
    SELECT id FROM organizations WHERE level = 'division' AND is_active = true LIMIT 5
  LOOP
    SELECT id INTO v_pos_id FROM positions WHERE organization_id = v_org.id AND is_critical = true LIMIT 1;
    SELECT id INTO v_p3 FROM personnel WHERE organization_id = v_org.id AND status = 'active' ORDER BY birth_date DESC LIMIT 1;

    IF v_pos_id IS NOT NULL AND v_p3 IS NOT NULL THEN
      INSERT INTO succession_plans (position_id, plan_status, notes)
      VALUES (v_pos_id, 'approved', 'แผนการพัฒนาสำหรับทดแทนการเกษียณ')
      RETURNING id INTO v_plan_id;

      INSERT INTO succession_plan_candidates (succession_plan_id, personnel_id, readiness, readiness_score, is_primary, notes)
      VALUES (v_plan_id, v_p3, 'ready_now', 85, true, 'ผู้สมัครหลัก ความพร้อมสูงผ่านการอบรมแล้ว');
    END IF;
  END LOOP;

  -- F. Seed Alert Rules and Alerts
  INSERT INTO alert_rules (code, name_th, severity, is_active, conditions)
  VALUES 
    ('CRIT_POS_VACANT', 'ตำแหน่งสำคัญว่างโดยไม่มีผู้สืบทอด', 'critical', true, '{}'::jsonb),
    ('NEAR_RETIRE_1Y', 'บุคลากรในตำแหน่งสำคัญจะเกษียณใน 1 ปี', 'warning', true, '{}'::jsonb)
  RETURNING id INTO v_rule_id;

  INSERT INTO alerts (alert_rule_id, severity, title, message, status)
  VALUES 
    (v_rule_id, 'critical', 'พบตำแหน่งว่างสำคัญ', 'ตำแหน่ง นิติกรเชี่ยวชาญ (กองบริหารทรัพยากรบุคคล) ว่างโดยไม่มีแผนสืบทอดตำแหน่ง', 'active'),
    (v_rule_id, 'warning', 'ใกล้เกษียณอายุ', 'ผู้ดำรงตำแหน่งผู้อำนวยการกำลังจะเกษียณอายุการทำงานในอีก 8 เดือนข้างหน้า', 'active');

END $$;

-- 4. Re-calculate risks for all personnel and organizations to generate risk scores based on new seeds
SELECT recalculate_all_risks();
