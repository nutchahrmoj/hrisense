-- Migration 032: Fix mojibake (Lao characters) in org abbreviations + position codes
-- ============================================================================
-- 3 organizations had their abbreviation_th stored with Lao-script characters
-- (U+0E80 block) instead of Thai (U+0E00 block) due to a seeding encoding bug.
-- Their full names (name_th) were correct, but the abbreviations were garbled:
--   ASDG (กลุ่มพัฒนาระบบบริหารฯ)        ກພບ.  -> กพบ.
--   IAG  (กลุ่มตรวจสอบภายใน)          ກຕພ.  -> กตภ.
--   PJCD (กองประสานราชการยุติธรรมฯ)  ກປຍ.  -> กปย.
-- Correct values taken from migration 029's CASE WHEN intent.
-- The same Lao prefix leaked into the 15 position_codes (5 positions x 3 orgs).
--
-- NOTE: this is a string-level map, NOT a mechanical -0x80 decode — the Lao char
-- ພ maps to พ (ASDG) in one abbreviation and ภ (IAG) in another, so each full
-- abbreviation must be mapped explicitly.

UPDATE organizations
SET abbreviation_th = CASE org_code
  WHEN 'ASDG' THEN 'กพบ.'
  WHEN 'IAG'  THEN 'กตภ.'
  WHEN 'PJCD' THEN 'กปย.'
END
WHERE org_code IN ('ASDG','IAG','PJCD');

UPDATE positions SET position_code = replace(position_code, 'ກພບ.', 'กพบ.') WHERE position_code LIKE 'ກພບ.%';
UPDATE positions SET position_code = replace(position_code, 'ກຕພ.', 'กตภ.') WHERE position_code LIKE 'ກຕພ.%';
UPDATE positions SET position_code = replace(position_code, 'ກປຍ.', 'กปย.') WHERE position_code LIKE 'ກປຍ.%';
