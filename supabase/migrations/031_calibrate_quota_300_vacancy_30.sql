-- Migration 031: Calibrate demo data to the real OPSMJ numbers
-- ============================================================================
-- Business truth (per domain expert): สำนักงานปลัดกระทรวงยุติธรรม (OPSMJ) has
-- a total authorized strength of 300 positions, with ~30 currently vacant
-- (i.e. ~270 filled, ~10% vacancy rate).
--
-- The original seed had 300 active personnel and division headcount_quota summing
-- to 1,600, which was unrealistic. This migration calibrates the data:
--   1. Mark 30 active personnel as 'resigned' (spread ~2 per division) so active = 270
--      → their positions become the ~30 vacancies.
--   2. Set each division's headcount_quota proportional to its remaining active
--      personnel, scaled to sum to 300 (each slightly above its headcount, so
--      vacancies spread to ~30 total).
--
-- Idempotency note: re-running after the seed resets the local DB reproduces the
-- same target state. Run calculate_org_risk_summary() for all orgs afterwards to
-- refresh the snapshot (see migration 030).

-- 1) Deactivate 30 active personnel (spread ~2 per division) -> 270 active remain
WITH ranked AS (
  SELECT id, organization_id,
    row_number() OVER (PARTITION BY organization_id ORDER BY id) AS rn
  FROM personnel WHERE status = 'active'
)
UPDATE personnel SET status = 'resigned', updated_at = now()
WHERE id IN (
  SELECT id FROM ranked WHERE rn <= 2 ORDER BY organization_id, rn LIMIT 30
);

-- 2) Division headcount_quota proportional to active personnel, summing to 300
UPDATE organizations o
SET headcount_quota = sub.new_quota
FROM (
  SELECT o2.id,
    round(count(p.id) * 300.0
          / nullif((SELECT count(*) FROM personnel WHERE status = 'active'), 0))::int AS new_quota
  FROM organizations o2
  LEFT JOIN personnel p ON p.organization_id = o2.id AND p.status = 'active'
  WHERE o2.level = 'division' AND o2.is_active
  GROUP BY o2.id
) sub
WHERE o.id = sub.id;

-- 3) Refresh the snapshot for all orgs
SELECT count(*) AS recomputed
FROM (SELECT calculate_org_risk_summary(o.id) FROM organizations o WHERE o.is_active) x;
