-- ============================================================================
-- HRiSENSE Migration 024: Data integrity (SECURITY_AUDIT M3 + M4)
--
-- M3: the app (src/lib, functions, seed) assigns 'critical' to risk_level, but
--     the enum only had ('green','amber','red') -> runtime errors.
-- M4: profiles.role was VARCHAR(50); convert to the existing user_role enum so
--     invalid roles (typos, escalation attempts) cannot be stored.
-- ============================================================================

-- M3: add the missing enum value (no-op if a prior migration already added it).
ALTER TYPE risk_level ADD VALUE IF NOT EXISTS 'critical';

-- M4: normalize any out-of-range values, then convert the column to the enum.
UPDATE profiles SET role = 'viewer' WHERE role NOT IN ('admin', 'viewer');
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN role TYPE user_role USING role::user_role;
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'viewer';
