-- ============================================================================
-- Migration 023: Enable RLS on burnout factors table
-- Addresses Issue #32 / PR #24 — M1 (missing RLS on burnout factors)
-- ============================================================================

-- 1. Enable RLS on personnel_burnout_factors
ALTER TABLE personnel_burnout_factors ENABLE ROW LEVEL SECURITY;

-- 2. Admin full access
CREATE POLICY "burnout_factors_admin_all" ON personnel_burnout_factors
  FOR ALL USING (is_admin());

-- 3. Authenticated users can read burnout data for personnel in their org hierarchy
CREATE POLICY "burnout_factors_viewer_read" ON personnel_burnout_factors
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM personnel p
      WHERE p.id = personnel_burnout_factors.personnel_id
      AND is_in_org_hierarchy(p.organization_id)
    )
  );

-- 4. Ensure authenticated role can read (RLS will scope the data)
GRANT SELECT ON personnel_burnout_factors TO authenticated;
