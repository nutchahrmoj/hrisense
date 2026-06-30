-- ============================================================================
-- Migration 027: Fix readiness_level enum drift
-- ============================================================================
-- Some remote environments had readiness_level values ready_soon/ready_future,
-- while the repo migrations and application use ready_1_2_years/ready_3_5_years.
-- ADD VALUE IF NOT EXISTS is safe for both fresh and drifted environments.
-- ============================================================================

ALTER TYPE readiness_level ADD VALUE IF NOT EXISTS 'ready_1_2_years';
ALTER TYPE readiness_level ADD VALUE IF NOT EXISTS 'ready_3_5_years';
