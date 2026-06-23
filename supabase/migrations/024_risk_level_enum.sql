-- Migration 024: Add 'critical' to risk_level enum
-- Addresses Issue #32 / PR #29 — data integrity for critical risk classification

-- Add 'critical' value to the existing risk_level enum
ALTER TYPE risk_level ADD VALUE IF NOT EXISTS 'critical';

-- Update the risk_color_map and related functions to handle 'critical'
-- The application already handles 'critical' in risk-colors.ts (bg-red-700)
-- This migration ensures the database enum matches the application layer
