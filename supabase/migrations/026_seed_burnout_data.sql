-- ============================================================================
-- Migration 022: Seed Burnout Factors Data
-- ============================================================================
-- สร้างข้อมูลปัจจัย Burnout สำหรับบุคลากรที่มีอยู่ (450 records)
-- ข้อมูลถูกสร้างแบบ deterministic (ขึ้นกับ age, position, org)
-- ไม่ใช่ค่าสุ่มล้วนๆ — สะท้อนรูปแบบจริง:
--   - คนใกล้เกษียณมักมี burnout สูงกว่า
--   - ตำแหน่งวิชาการมักมี workload สูง
--   - คนอายุน้อยมักมี overtime สูง
-- ============================================================================

DO $$
DECLARE
  v_personnel RECORD;
  v_age INTEGER;
  v_years_to_retirement NUMERIC;
  v_is_executive BOOLEAN;
  v_is_near_retirement BOOLEAN;
  v_org_size_factor NUMERIC;
BEGIN
  FOR v_personnel IN
    SELECT p.id, p.birth_date, p.retirement_date, p.position_type_id,
           p.organization_id, p.salary, p.position_level_id
    FROM personnel p
    WHERE p.status = 'active'
  LOOP
    -- คำนวณ age
    v_age := EXTRACT(YEAR FROM age(CURRENT_DATE, v_personnel.birth_date))::INTEGER;
    v_years_to_retirement := GREATEST(0,
      EXTRACT(YEAR FROM age(CURRENT_DATE, v_personnel.retirement_date))::NUMERIC
    );
    v_is_executive := EXISTS (
      SELECT 1 FROM position_types pt
      WHERE pt.id = v_personnel.position_type_id AND pt.category = 'บริหาร'
    );
    v_is_near_retirement := v_years_to_retirement <= 3;

    -- สร้างข้อมูลปัจจัย (deterministic ขึ้นกับ age + position)
    INSERT INTO personnel_burnout_factors (
      personnel_id, year,
      late_days_ytd, absent_days_ytd, performance_score,
      overtime_hours_ytd, training_hours_ytd, workload_index,
      assessed_at
    ) VALUES (
      v_personnel.id,
      EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,

      -- late_days: คนใกล้เกษียณ/อาวุโสมักมาสายมากขึ้น
      CASE
        WHEN v_is_near_retirement THEN 8 + (v_age % 7)::INTEGER
        WHEN v_age > 50 THEN 4 + (v_age % 5)::INTEGER
        WHEN v_age < 30 THEN 2 + (v_age % 4)::INTEGER
        ELSE 1 + (v_age % 3)::INTEGER
      END,

      -- absent_days: คนใกล้เกษียณ/อายุสูงมักขาดงานมากขึ้น
      CASE
        WHEN v_is_near_retirement THEN 5 + (v_age % 5)::INTEGER
        WHEN v_age > 50 THEN 2 + (v_age % 3)::INTEGER
        ELSE (v_age % 3)::INTEGER
      END,

      -- performance_score: คนอายุน้อย + ได้รับการฝึกมาก = ประเมินสูง
      -- คนใกล้เกษียณอาจประเมินต่ำลง
      CASE
        WHEN v_is_near_retirement THEN 60 + (v_age % 15)::NUMERIC
        WHEN v_age < 35 THEN 80 + (v_age % 15)::NUMERIC
        WHEN v_age < 45 THEN 70 + (v_age % 20)::NUMERIC
        ELSE 65 + (v_age % 18)::NUMERIC
      END,

      -- overtime_hours: คนอายุน้อย + ตำแหน่งวิชาการมัก OT สูง
      CASE
        WHEN v_is_executive THEN 80 + (v_age % 60)::NUMERIC
        WHEN v_age < 35 THEN 120 + (v_age % 80)::NUMERIC
        WHEN v_age < 45 THEN 80 + (v_age % 50)::NUMERIC
        ELSE 40 + (v_age % 30)::NUMERIC
      END,

      -- training_hours: คนอายุน้อยมักถูกฝึกมากกว่า
      -- คนใกล้เกษียณอาจไม่ถูกฝึก
      CASE
        WHEN v_is_near_retirement THEN 4 + (v_age % 6)::NUMERIC
        WHEN v_age < 35 THEN 20 + (v_age % 15)::NUMERIC
        WHEN v_age < 45 THEN 12 + (v_age % 12)::NUMERIC
        ELSE 8 + (v_age % 10)::NUMERIC
      END,

      -- workload_index: บริหาร/วิชาการมัก workload สูง
      CASE
        WHEN v_is_executive THEN 70 + (v_age % 20)::NUMERIC
        WHEN v_age < 35 THEN 60 + (v_age % 25)::NUMERIC
        WHEN v_is_near_retirement THEN 30 + (v_age % 20)::NUMERIC
        ELSE 45 + (v_age % 30)::NUMERIC
      END,

      NOW()
    );
  END LOOP;

  RAISE NOTICE 'Seeded burnout factors for all active personnel.';
END $$;

-- คำนวณ burnout_risk สำหรับทุกคน
SELECT update_all_burnout_risks();
