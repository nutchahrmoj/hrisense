-- ============================================================================
-- Migration 027: Fix readiness_level enum drift (data-integrity)
-- ============================================================================
-- Remote DB drift: readiness_level was created with 'ready_soon' and
-- 'ready_future', but migration 001 + all dependent code (010/011/013/016/020
-- + the TS app) use 'ready_1_2_years' and 'ready_3_5_years'.
--
-- Symptom: CREATE VIEW in 013 failed:
--   ERROR: invalid input value for enum readiness_level: "ready_1_2_years"
-- (plpgsql functions in 010 deferred validation, so they created OK but would
--  error at runtime; views validate at CREATE time, so they failed.)
--
-- Fix: ADD the canonical values. IF NOT EXISTS makes this safe on BOTH:
--   - drifted remote  -> adds the missing values
--   - fresh env       -> 001 already created them -> no-op
-- The vestigial 'ready_soon'/'ready_future' are left in place on the remote
-- (unused + tables empty; removing enum values requires recreating the type).
-- ============================================================================

ALTER TYPE readiness_level ADD VALUE IF NOT EXISTS 'ready_1_2_years';
ALTER TYPE readiness_level ADD VALUE IF NOT EXISTS 'ready_3_5_years';
