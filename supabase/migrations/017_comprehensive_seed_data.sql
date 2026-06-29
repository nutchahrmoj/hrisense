-- ============================================================================
-- HRiSENSE Migration 017: Comprehensive Seed Data (300 Personnel)
-- โครงสร้าง: กระทรวงยุติธรรม → สป.ยธ. → 17 หน่วยงานในสังกัด
-- ============================================================================

-- ============================================================================
-- 1. Organizations (Office of the Permanent Secretary, Ministry of Justice)
--    โครงสร้าง: กระทรวงยุติธรรม → สป.ยธ. → 17 หน่วยงานในสังกัด
-- ============================================================================
INSERT INTO organizations (id, org_code, name_th, name_en, abbreviation_th, abbreviation_en, level, org_type, province, headcount_quota, parent_id, hierarchy_path, is_active) VALUES
  -- Ministry Level
  ('a0000001-0000-0000-0000-000000000001', 'MOJ', 'กระทรวงยุติธรรม', 'Ministry of Justice', 'ยธ.', 'MOJ', 'ministry', 'ส่วนกลาง', 'กรุงเทพมหานคร', 5000, NULL, 'MOJ', true),

  -- Department Level: Office of the Permanent Secretary
  ('a0000001-0000-0000-0000-000000000002', 'OPSMJ', 'สำนักงานปลัดกระทรวงยุติธรรม', 'Office of the Permanent Secretary, Ministry of Justice', 'สป.ยธ.', 'OPSMJ', 'department', 'ส่วนกลาง', 'กรุงเทพมหานคร', 3000, 'a0000001-0000-0000-0000-000000000001', 'MOJ.OPSMJ', true),

  -- Divisions / Centers under OPSMJ (17 หน่วยงานในสังกัด สป.ยธ.)
  ('a0000001-0000-0000-0000-000000000003', 'GD',    'กองกลาง',                                'Central Division',                          'กก.',    'GD',    'division', 'ส่วนกลาง', 'กรุงเทพมหานคร', 180, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.GD',    true),
  ('a0000001-0000-0000-0000-000000000004', 'HRD',   'กองบริหารทรัพยากรบุคคล',                'Human Resource Management Division',         'กบค.',   'HRD',   'division', 'ส่วนกลาง', 'กรุงเทพมหานคร', 150, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.HRD',   true),
  ('a0000001-0000-0000-0000-000000000005', 'FMD',   'กองบริหารการคลัง',                        'Financial Management Division',              'กบค.',   'FMD',   'division', 'ส่วนกลาง', 'กรุงเทพมหานคร', 120, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.FMD',   true),
  ('a0000001-0000-0000-0000-000000000006', 'IAD',   'กองการต่างประเทศ',                        'International Affairs Division',             'กตท.',   'IAD',   'division', 'ส่วนกลาง', 'กรุงเทพมหานคร',  80, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.IAD',   true),
  ('a0000001-0000-0000-0000-000000000007', 'DCD',   'กองออกแบบและก่อสร้าง',                  'Design and Construction Division',           'กอศ.',   'DCD',   'division', 'ส่วนกลาง', 'กรุงเทพมหานคร', 100, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.DCD',   true),
  ('a0000001-0000-0000-0000-000000000008', 'ICTC',  'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร',    'Information and Communication Technology Center', 'ศทส.', 'ICTC', 'division', 'ส่วนกลาง', 'กรุงเทพมหานคร', 120, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.ICTC',  true),
  ('a0000001-0000-0000-0000-000000000009', 'LD',    'กองกฎหมาย',                              'Legal Division',                             'กกด.',   'LD',    'division', 'ส่วนกลาง', 'กรุงเทพมหานคร', 100, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.LD',    true),
  ('a0000001-0000-0000-0000-000000000010', 'SPD',   'กองยุทธศาสตร์และแผนงาน',                'Strategy and Plan Division',                 'กยผ.',   'SPD',   'division', 'ส่วนกลาง', 'กรุงเทพมหานคร', 100, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.SPD',   true),
  ('a0000001-0000-0000-0000-000000000011', 'JPDI',  'สถาบันพัฒนาบุคลากรกระทรวงยุติธรรม',    'Justice Personnel Development Institute',    'สบย.',   'JPDI',  'division', 'ส่วนกลาง', 'กรุงเทพมหานคร',  90, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.JPDI',  true),
  ('a0000001-0000-0000-0000-000000000012', 'IAG',   'กลุ่มตรวจสอบภายใน',                      'Internal Audit Group',                       'ກตພ.',   'IAG',   'division', 'ส่วนกลาง', 'กรุงเทพมหานคร',  50, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.IAG',   true),
  ('a0000001-0000-0000-0000-000000000013', 'ASDG',  'กลุ่มพัฒนาระบบบริหารกระทรวงยุติธรรม',  'Administrative System Development Group',    'ກພບ.',   'ASDG',  'division', 'ส่วนกลาง', 'กรุงเทพมหานคร',  60, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.ASDG',  true),
  ('a0000001-0000-0000-0000-000000000014', 'IGO',   'สำนักผู้ตรวจราชการกระทรวงยุติธรรม',      'Inspector General Office',                   'สบย.',   'IGO',   'division', 'ส่วนกลาง', 'กรุงเทพมหานคร',  80, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.IGO',   true),
  ('a0000001-0000-0000-0000-000000000015', 'JIDD',  'กองพัฒนานวัตกรรมการยุติธรรม',          'Justice Innovation Development Division',    'กพน.',   'JIDD',  'division', 'ส่วนกลาง', 'กรุงเทพมหานคร',  70, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.JIDD',  true),
  ('a0000001-0000-0000-0000-000000000016', 'ACOC',  'ศูนย์ปฏิบัติการต่อต้านการทุจริต',        'Anti-Corruption Operation Center',           'ศปท.',   'ACOC',  'division', 'ส่วนกลาง', 'กรุงเทพมหานคร',  60, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.ACOC',  true),
  ('a0000001-0000-0000-0000-000000000017', 'JSC',   'ศูนย์บริการร่วมกระทรวงยุติธรรม',        'Justice Service Center',                     'ศบร.',   'JSC',   'division', 'ส่วนกลาง', 'กรุงเทพมหานคร',  70, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.JSC',   true),
  ('a0000001-0000-0000-0000-000000000018', 'JFO',   'สำนักงานกองทุนยุติธรรม',                'Justice Fund Office',                        'สกย.',   'JFO',   'division', 'ส่วนกลาง', 'กรุงเทพมหานคร',  80, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.JFO',   true),
  ('a0000001-0000-0000-0000-000000000019', 'PJCD',  'กองประสานราชการยุติธรรมจังหวัด',        'Provincial Justice Coordination Division',   'ກปย.',   'PJCD',  'division', 'ส่วนกลาง', 'กรุงเทพมหานคร',  90, 'a0000001-0000-0000-0000-000000000002', 'MOJ.OPSMJ.PJCD',  true);

-- ============================================================================
-- 2. Position Types
-- ============================================================================
INSERT INTO position_types (id, code, name_th, name_en, category, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'EXEC', 'ตำแหน่งบริหาร', 'Executive Positions', 'บริหาร', 1),
  ('b0000001-0000-0000-0000-000000000002', 'DIR', 'ตำแหน่งอำนวยการ', 'Directorial Positions', 'อำนวยการ', 2),
  ('b0000001-0000-0000-0000-000000000003', 'ACAD', 'ตำแหน่งวิชาการ', 'Academic/Professional Positions', 'วิชาการ', 3),
  ('b0000001-0000-0000-0000-000000000004', 'GEN', 'ตำแหน่งทั่วไป', 'General Positions', 'ทั่วไป', 4);

-- ============================================================================
-- 3. Position Levels
-- ============================================================================
INSERT INTO position_levels (id, code, name_th, name_en, position_type_id, c_level, min_salary, max_salary, sort_order) VALUES
  -- Executive
  ('c0000001-0000-0000-0000-000000000001', 'EXEC_HIGH', 'บริหารสูง', 'Senior Executive', 'b0000001-0000-0000-0000-000000000001', 'C11', 75000, 120000, 1),
  ('c0000001-0000-0000-0000-000000000002', 'EXEC_MID', 'บริหารกลาง', 'Middle Executive', 'b0000001-0000-0000-0000-000000000001', 'C9', 55000, 85000, 2),
  ('c0000001-0000-0000-0000-000000000003', 'EXEC_LOW', 'บริหารต้น', 'Junior Executive', 'b0000001-0000-0000-0000-000000000001', 'C8', 42000, 62000, 3),
  -- Directorial
  ('c0000001-0000-0000-0000-000000000004', 'DIR_HIGH', 'อำนวยการสูง', 'Senior Directorial', 'b0000001-0000-0000-0000-000000000002', 'C9', 55000, 85000, 4),
  ('c0000001-0000-0000-0000-000000000005', 'DIR_MID', 'อำนวยการกลาง', 'Middle Directorial', 'b0000001-0000-0000-0000-000000000002', 'C8', 42000, 62000, 5),
  ('c0000001-0000-0000-0000-000000000006', 'DIR_LOW', 'อำนวยการต้น', 'Junior Directorial', 'b0000001-0000-0000-0000-000000000002', 'C7', 35000, 52000, 6),
  -- Academic/Professional
  ('c0000001-0000-0000-0000-000000000007', 'ACAD_DISTINGUISHED', 'ทรงคุณวุฒิ', 'Distinguished Expert', 'b0000001-0000-0000-0000-000000000003', 'C9', 55000, 85000, 7),
  ('c0000001-0000-0000-0000-000000000008', 'ACAD_EXPERT', 'เชี่ยวชาญ', 'Expert', 'b0000001-0000-0000-0000-000000000003', 'C8', 42000, 62000, 8),
  ('c0000001-0000-0000-0000-000000000009', 'ACAD_SENIOR', 'ชำนาญการพิเศษ', 'Senior Professional', 'b0000001-0000-0000-0000-000000000003', 'C7', 35000, 52000, 9),
  ('c0000001-0000-0000-0000-000000000010', 'ACAD_PRO', 'ชำนาญการ', 'Professional', 'b0000001-0000-0000-0000-000000000003', 'C6', 28000, 42000, 10),
  ('c0000001-0000-0000-0000-000000000011', 'ACAD_PRACT', 'ปฏิบัติการ', 'Practitioner', 'b0000001-0000-0000-0000-000000000003', 'C5', 15000, 28000, 11),
  -- General
  ('c0000001-0000-0000-0000-000000000012', 'GEN_SKILLED', 'ชำนาญงาน', 'Skilled', 'b0000001-0000-0000-0000-000000000004', NULL, 18000, 32000, 12),
  ('c0000001-0000-0000-0000-000000000013', 'GEN_PROF', 'ชำนาญการทั่วไป', 'Professional (General)', 'b0000001-0000-0000-0000-000000000004', NULL, 15000, 28000, 13),
  ('c0000001-0000-0000-0000-000000000014', 'GEN_OPER', 'ปฏิบัติงาน', 'Operator', 'b0000001-0000-0000-0000-000000000004', NULL, 9400, 18000, 14);

-- ============================================================================
-- 4. Position Families
-- ============================================================================
INSERT INTO position_families (id, code, name_th, name_en) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'LEGAL', 'นิติการ', 'Legal'),
  ('d0000001-0000-0000-0000-000000000002', 'FINANCE', 'การเงินและบัญชี', 'Finance and Accounting'),
  ('d0000001-0000-0000-0000-000000000003', 'COMPUTER', 'คอมพิวเตอร์', 'Computer/IT'),
  ('d0000001-0000-0000-0000-000000000004', 'ADMIN_GEN', 'บริหารงานทั่วไป', 'General Administration'),
  ('d0000001-0000-0000-0000-000000000005', 'HR', 'การบริหารงานบุคคล', 'Human Resources'),
  ('d0000001-0000-0000-0000-000000000006', 'CORRECTION', 'ราชทัณฑ์', 'Corrections'),
  ('d0000001-0000-0000-0000-000000000007', 'ENFORCE', 'บังคับคดี', 'Legal Execution'),
  ('d0000001-0000-0000-0000-000000000008', 'IP_LAW', 'ทรัพย์สินทางปัญญา', 'Intellectual Property'),
  ('d0000001-0000-0000-0000-000000000009', 'MEDICAL', 'ทางการแพทย์', 'Medical'),
  ('d0000001-0000-0000-0000-000000000010', 'LANG', 'ภาษา', 'Language/Interpretation');

-- ============================================================================
-- 5. Personnel (300 Records with Diverse Conditions)
--    กระจายเข้า 17 หน่วยงานในสังกัด สป.ยธ. (org-3 ถึง org-19)
-- ============================================================================
DO $$
DECLARE
  i INTEGER;
  v_id UUID;
  v_citizen_id VARCHAR(13);
  v_prefix_th VARCHAR(50);
  v_first_name_th VARCHAR(200);
  v_last_name_th VARCHAR(200);
  v_birth_date DATE;
  v_gov_start_date DATE;
  v_org_id UUID;
  v_position_type_id UUID;
  v_position_level_id UUID;
  v_position_family_id UUID;
  v_salary NUMERIC(12,2);
  v_education education_level;
  v_retirement_years NUMERIC(4,1);
  v_risk_score NUMERIC(5,2);
  v_risk_level risk_level;
  v_retirement_risk NUMERIC(5,2);
  v_transfer_risk NUMERIC(5,2);
  v_talent_risk NUMERIC(5,2);

  -- Name pools
  v_prefixes_th TEXT[] := ARRAY['นาย', 'นาง', 'นางสาว'];
  v_first_names_male TEXT[] := ARRAY['สมชาย', 'สมศักดิ์', 'วิชัย', 'ประยุทธ', 'สุชาติ', 'พิชัย', 'อนุชา', 'วีระ', 'ธนพล', 'กิตติ', 'สุรชัย', 'ประเสริฐ', 'วิทยา', 'ธนา', 'พงษ์ศักดิ์', 'ชาติชาย', 'สุรเกียรติ', 'เทอดไท', 'วีรวัฒน์', 'ธนวัฒน์'];
  v_first_names_female TEXT[] := ARRAY['สมหญิง', 'วิไล', 'สุภาพร', 'ประไพ', 'วรรณา', 'มาลี', 'อำไพ', 'สุภาพ', 'นภา', 'ทิพย์วรรณ', 'กนกพร', 'ศิริพร', 'พรทิพย์', 'วิภา', 'นุชจร', 'สมจิตร', 'ปวีณา', 'จิราพร', 'สุทธินี', 'อรุณี'];
  v_last_names TEXT[] := ARRAY['จันทร์แก้ว', 'ศรีสุข', 'วงศ์ธรรม', 'ทองดี', 'เพชรพลอย', 'สุขสวัสดิ์', 'วงศ์สุวรรณ', 'ศรีวงศ์', 'ทองจันทร์', 'แก้วมณี', 'สุวรรณศรี', 'พงษ์พันธุ์', 'ชาติสกุล', 'วงศ์ศิริ', 'ไทยสุวัฒน์', 'สยามกุล', 'นครินทร์', 'พิทยากรณ์', 'สุขุมวิท', 'วงศ์ปรีชา', 'ธรรมรักษ์', 'ศรีวิไล', 'ทองพูน', 'แก้วขวัญ', 'วงศ์ไพศาล', 'สุขเกษม', 'เจริญผล', 'ศิริสุข', 'พรประเสริฐ', 'ไทยพาณิชย์'];

  -- Organization IDs: 17 divisions under OPSMJ (org-3 to org-19)
  v_org_ids UUID[] := ARRAY[
    'a0000001-0000-0000-0000-000000000003'::UUID,  -- กองกลาง (GD)
    'a0000001-0000-0000-0000-000000000004'::UUID,  -- กองบริหารทรัพยากรบุคคล (HRD)
    'a0000001-0000-0000-0000-000000000005'::UUID,  -- กองบริหารการคลัง (FMD)
    'a0000001-0000-0000-0000-000000000006'::UUID,  -- กองการต่างประเทศ (IAD)
    'a0000001-0000-0000-0000-000000000007'::UUID,  -- กองออกแบบและก่อสร้าง (DCD)
    'a0000001-0000-0000-0000-000000000008'::UUID,  -- ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร (ICTC)
    'a0000001-0000-0000-0000-000000000009'::UUID,  -- กองกฎหมาย (LD)
    'a0000001-0000-0000-0000-000000000010'::UUID,  -- กองยุทธศาสตร์และแผนงาน (SPD)
    'a0000001-0000-0000-0000-000000000011'::UUID,  -- สถาบันพัฒนาบุคลากรกระทรวงยุติธรรม (JPDI)
    'a0000001-0000-0000-0000-000000000012'::UUID,  -- กลุ่มตรวจสอบภายใน (IAG)
    'a0000001-0000-0000-0000-000000000013'::UUID,  -- กลุ่มพัฒนาระบบบริหารกระทรวงยุติธรรม (ASDG)
    'a0000001-0000-0000-0000-000000000014'::UUID,  -- สำนักผู้ตรวจราชการกระทรวงยุติธรรม (IGO)
    'a0000001-0000-0000-0000-000000000015'::UUID,  -- กองพัฒนานวัตกรรมการยุติธรรม (JIDD)
    'a0000001-0000-0000-0000-000000000016'::UUID,  -- ศูนย์ปฏิบัติการต่อต้านการทุจริต (ACOC)
    'a0000001-0000-0000-0000-000000000017'::UUID,  -- ศูนย์บริการร่วมกระทรวงยุติธรรม (JSC)
    'a0000001-0000-0000-0000-000000000018'::UUID,  -- สำนักงานกองทุนยุติธรรม (JFO)
    'a0000001-0000-0000-0000-000000000019'::UUID   -- กองประสานราชการยุติธรรมจังหวัด (PJCD)
  ];

  v_position_type_ids UUID[] := ARRAY[
    'b0000001-0000-0000-0000-000000000001'::UUID,
    'b0000001-0000-0000-0000-000000000002'::UUID,
    'b0000001-0000-0000-0000-000000000003'::UUID,
    'b0000001-0000-0000-0000-000000000004'::UUID
  ];

  v_position_level_ids UUID[] := ARRAY[
    'c0000001-0000-0000-0000-000000000001'::UUID,
    'c0000001-0000-0000-0000-000000000002'::UUID,
    'c0000001-0000-0000-0000-000000000003'::UUID,
    'c0000001-0000-0000-0000-000000000004'::UUID,
    'c0000001-0000-0000-0000-000000000005'::UUID,
    'c0000001-0000-0000-0000-000000000006'::UUID,
    'c0000001-0000-0000-0000-000000000007'::UUID,
    'c0000001-0000-0000-0000-000000000008'::UUID,
    'c0000001-0000-0000-0000-000000000009'::UUID,
    'c0000001-0000-0000-0000-000000000010'::UUID,
    'c0000001-0000-0000-0000-000000000011'::UUID
  ];

  v_position_family_ids UUID[] := ARRAY[
    'd0000001-0000-0000-0000-000000000001'::UUID,
    'd0000001-0000-0000-0000-000000000002'::UUID,
    'd0000001-0000-0000-0000-000000000003'::UUID,
    'd0000001-0000-0000-0000-000000000004'::UUID,
    'd0000001-0000-0000-0000-000000000005'::UUID,
    'd0000001-0000-0000-0000-000000000006'::UUID,
    'd0000001-0000-0000-0000-000000000007'::UUID,
    'd0000001-0000-0000-0000-000000000008'::UUID,
    'd0000001-0000-0000-0000-000000000009'::UUID,
    'd0000001-0000-0000-0000-000000000010'::UUID
  ];

BEGIN
  FOR i IN 1..300 LOOP
    -- Generate UUID
    v_id := uuid_generate_v4();

    -- Generate citizen ID (13 digits)
    v_citizen_id := LPAD(FLOOR(RANDOM() * 9999999999999)::TEXT, 13, '0');

    -- Generate name based on gender (60% male, 40% female)
    IF RANDOM() < 0.6 THEN
      v_prefix_th := 'นาย';
      v_first_name_th := v_first_names_male[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_first_names_male, 1))::INTEGER];
    ELSE
      IF RANDOM() < 0.5 THEN
        v_prefix_th := 'นาง';
      ELSE
        v_prefix_th := 'นางสาว';
      END IF;
      v_first_name_th := v_first_names_female[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_first_names_female, 1))::INTEGER];
    END IF;
    v_last_name_th := v_last_names[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_last_names, 1))::INTEGER];

    -- Generate birth date (age 25-60, with distribution)
    -- 10% near retirement (56-60), 30% senior (46-55), 40% mid-career (35-45), 20% junior (25-34)
    IF RANDOM() < 0.1 THEN
      v_birth_date := CURRENT_DATE - (INTERVAL '56 years' + (RANDOM() * INTERVAL '4 years'));
    ELSIF RANDOM() < 0.4 THEN
      v_birth_date := CURRENT_DATE - (INTERVAL '46 years' + (RANDOM() * INTERVAL '9 years'));
    ELSIF RANDOM() < 0.8 THEN
      v_birth_date := CURRENT_DATE - (INTERVAL '35 years' + (RANDOM() * INTERVAL '10 years'));
    ELSE
      v_birth_date := CURRENT_DATE - (INTERVAL '25 years' + (RANDOM() * INTERVAL '9 years'));
    END IF;

    -- Government start date (1-35 years ago)
    v_gov_start_date := CURRENT_DATE - (INTERVAL '1 year' + (RANDOM() * INTERVAL '34 years'));

    -- Select organization, position type, level, family
    v_org_id := v_org_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_org_ids, 1))::INTEGER];
    v_position_type_id := v_position_type_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_position_type_ids, 1))::INTEGER];
    v_position_level_id := v_position_level_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_position_level_ids, 1))::INTEGER];
    v_position_family_id := v_position_family_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_position_family_ids, 1))::INTEGER];

    -- Generate salary based on position level
    v_salary := 15000 + (RANDOM() * 85000);

    -- Education level
    IF RANDOM() < 0.1 THEN
      v_education := 'doctorate';
    ELSIF RANDOM() < 0.4 THEN
      v_education := 'masters';
    ELSIF RANDOM() < 0.8 THEN
      v_education := 'bachelors';
    ELSE
      v_education := 'diploma';
    END IF;

    -- Calculate retirement years remaining
    -- อายุราชการสิ้นสุดวันที่ 30 กันยายน ของปีเกษียณ (ตามระเบียบราชการ)
    v_retirement_years := GREATEST(0,
      EXTRACT(YEAR FROM age(CURRENT_DATE,
        make_date(EXTRACT(YEAR FROM v_birth_date)::INTEGER + 60, 9, 30)
      ))::NUMERIC
    );

    -- Generate risk scores based on various factors
    -- Retirement risk: higher for those near retirement
    v_retirement_risk := CASE
      WHEN v_retirement_years <= 1 THEN 80 + (RANDOM() * 20)
      WHEN v_retirement_years <= 3 THEN 60 + (RANDOM() * 20)
      WHEN v_retirement_years <= 5 THEN 40 + (RANDOM() * 20)
      WHEN v_retirement_years <= 10 THEN 20 + (RANDOM() * 20)
      ELSE RANDOM() * 20
    END;

    -- Transfer risk: random with some pattern
    v_transfer_risk := RANDOM() * 60 + (CASE WHEN RANDOM() < 0.2 THEN 40 ELSE 0 END);

    -- Talent loss risk: higher for younger educated employees
    v_talent_risk := CASE
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, v_birth_date)) < 40 AND v_education IN ('masters', 'doctorate') THEN 50 + (RANDOM() * 40)
      ELSE RANDOM() * 50
    END;

    -- Overall risk score (weighted average)
    v_risk_score := (v_retirement_risk * 0.4 + v_transfer_risk * 0.3 + v_talent_risk * 0.3);

    -- Risk level: use 'red' for highest ('critical' enum value is not added
    -- until migration 024, which runs AFTER this seed in numeric order)
    IF v_risk_score > 80 THEN
      v_risk_level := 'red';
    ELSIF v_risk_score > 60 THEN
      v_risk_level := 'red';
    ELSIF v_risk_score > 40 THEN
      v_risk_level := 'amber';
    ELSE
      v_risk_level := 'green';
    END IF;

    -- Insert personnel
    INSERT INTO personnel (
      id, citizen_id, prefix_th, first_name_th, last_name_th,
      birth_date, government_start_date,
      organization_id, position_type_id, position_level_id, position_family_id,
      salary, education_level, status, gender
    ) VALUES (
      v_id, v_citizen_id, v_prefix_th, v_first_name_th, v_last_name_th,
      v_birth_date, v_gov_start_date,
      v_org_id, v_position_type_id, v_position_level_id, v_position_family_id,
      v_salary, v_education, 'active',
      CASE WHEN v_prefix_th = 'นาย' THEN 'male' ELSE 'female' END
    );

    -- Insert risk scores (upsert — a trigger may have already created the row)
    INSERT INTO personnel_risk_scores (
      personnel_id, retirement_risk, transfer_risk, talent_loss_risk, overall_score, risk_level
    ) VALUES (
      v_id, ROUND(v_retirement_risk::NUMERIC, 2), ROUND(v_transfer_risk::NUMERIC, 2),
      ROUND(v_talent_risk::NUMERIC, 2), ROUND(v_risk_score::NUMERIC, 2), v_risk_level
    )
    ON CONFLICT (personnel_id) DO UPDATE SET
      retirement_risk = EXCLUDED.retirement_risk,
      transfer_risk = EXCLUDED.transfer_risk,
      talent_loss_risk = EXCLUDED.talent_loss_risk,
      overall_score = EXCLUDED.overall_score,
      risk_level = EXCLUDED.risk_level,
      computed_at = NOW();

    -- Log progress every 50 records
    IF i % 50 = 0 THEN
      RAISE NOTICE 'Generated % personnel records...', i;
    END IF;
  END LOOP;

  RAISE NOTICE 'Successfully generated 300 personnel records with risk assessments.';
END $$;

-- ============================================================================
-- 6. Alerts (80 active alerts)
-- ============================================================================
DO $$
DECLARE
  i INTEGER;
  v_personnel_id UUID;
  v_org_id UUID;
  v_severity alert_severity;
  v_alert_type TEXT;
  v_title TEXT;
  v_message TEXT;

BEGIN
  FOR i IN 1..80 LOOP
    SELECT id, organization_id INTO v_personnel_id, v_org_id FROM personnel WHERE status = 'active' ORDER BY RANDOM() LIMIT 1;

    -- Determine alert type and severity
    IF RANDOM() < 0.3 THEN
      v_alert_type := 'retirement';
      v_severity := 'critical';
      v_title := 'บุคลากรจะเกษียณภายใน 1 ปี';
      v_message := 'บุคลากรในตำแหน่งสำคัญจะเกษียณอายุราชการภายใน 1 ปี จำเป็นต้องเร่งพัฒนาผู้สืบทอดตำแหน่ง';
    ELSIF RANDOM() < 0.5 THEN
      v_alert_type := 'succession';
      v_severity := 'warning';
      v_title := 'ตำแหน่งสำคัญไม่มีผู้สืบทอด';
      v_message := 'ตำแหน่งสำคัญยังไม่มีแผนสืบทอดตำแหน่งหรือไม่มีผู้สืบทอดที่เหมาะสม';
    ELSIF RANDOM() < 0.7 THEN
      v_alert_type := 'vacancy';
      v_severity := 'warning';
      v_title := 'อัตราว่างสูง';
      v_message := 'หน่วยงานมีอัตราว่างเกินกว่า 10% ของอัตราทั้งหมด';
    ELSIF RANDOM() < 0.85 THEN
      v_alert_type := 'risk';
      v_severity := 'critical';
      v_title := 'บุคลากรเสี่ยงสูง';
      v_message := 'บุคลากรมีคะแนนความเสี่ยงสูงกว่า 75 ต้องการการดูแลเร่งด่วน';
    ELSE
      v_alert_type := 'training';
      v_severity := 'info';
      v_title := 'ครบกำหนดฝึกอบรม';
      v_message := 'บุคลากรครบกำหนดเข้ารับการฝึกอบรมตามแผนพัฒนา';
    END IF;

    INSERT INTO alerts (
      severity, title, message, status,
      organization_id, personnel_id, indicator_value, threshold_value,
      created_at
    ) VALUES (
      v_severity, v_title, v_message, 'active',
      v_org_id, v_personnel_id,
      RANDOM() * 100,
      CASE WHEN v_severity = 'critical' THEN 75 WHEN v_severity = 'warning' THEN 50 ELSE 25 END,
      CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '30 days')
    );

    IF i % 20 = 0 THEN
      RAISE NOTICE 'Generated % alerts...', i;
    END IF;
  END LOOP;

  RAISE NOTICE 'Successfully generated 80 active alerts.';
END $$;

-- ============================================================================
-- Summary Statistics
-- ============================================================================
DO $$
DECLARE
  v_personnel_count INTEGER;
  v_alert_count INTEGER;
  v_critical_count INTEGER;
  v_red_count INTEGER;
  v_amber_count INTEGER;
  v_green_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_personnel_count FROM personnel;
  SELECT COUNT(*) INTO v_alert_count FROM alerts WHERE status = 'active';

  SELECT COUNT(*) INTO v_critical_count FROM personnel_risk_scores WHERE risk_level = 'red' AND overall_score >= 75;
  SELECT COUNT(*) INTO v_red_count FROM personnel_risk_scores WHERE risk_level = 'red' AND overall_score < 75;
  SELECT COUNT(*) INTO v_amber_count FROM personnel_risk_scores WHERE risk_level = 'amber';
  SELECT COUNT(*) INTO v_green_count FROM personnel_risk_scores WHERE risk_level = 'green';

  RAISE NOTICE '=== Seed Data Summary ===';
  RAISE NOTICE 'Personnel: %', v_personnel_count;
  RAISE NOTICE 'Risk Distribution - High Risk (>=75): %, Red: %, Amber: %, Green: %', v_critical_count, v_red_count, v_amber_count, v_green_count;
  RAISE NOTICE 'Active Alerts: %', v_alert_count;
END $$;
