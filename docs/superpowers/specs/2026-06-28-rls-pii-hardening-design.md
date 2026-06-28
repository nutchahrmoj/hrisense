# Design Spec — RLS / PII Hardening (View `security_invoker`)

- **Date:** 2026-06-28
- **Supersedes PR scope:** #22 (re-scoped), #24 (superseded), #29 (superseded)
- **Tracking issue:** [nutchahrmoj/hrisense#32](https://github.com/nutchahrmoj/hrisense/issues/32)
- **Branch:** `fix/view-security-invoker` (from `main` @ `7b1cf25`)
- **Status:** Design approved (Sections 1–3) — pending implementation plan (writing-plans skill)

## 1. Context & Scope Decision

### 1.1 Why this PR is narrow
A re-check of upstream `main` (`7b1cf25`) showed the bulk of the original audit remediation has already shipped:

| Original audit item | Status on `main` | Shipped via |
|---|---|---|
| C1/C2 unauthenticated PII leak | done (server.ts refactor, PII mask) | `4af2a79`, PR #28/#35 |
| C6/C7 RLS hardening (revoke anon) | done | migration `022_rls_hardening.sql` |
| M3/M4 `risk_level` enum | done | migration `024_risk_level_enum.sql` |
| Open-redirect / security headers / error pages | done | `4af2a79` |
| `publishable_key` fallback | done | PR #36 |
| Login error surfacing | done | `598e4e9` |
| `NEXT_PUBLIC_` env inline | done | `7b1cf25` |
| a11y main landmark | done | PR #34 |

**The one gap that remains:** Postgres views in this project are still `security_definer` (the default), so a view executes with its **owner's** privileges. In Supabase the owner is a superuser-level role that **bypasses RLS**. Even though base tables have RLS enabled and `anon` was revoked in `022`, an `authenticated` caller that still holds `SELECT` on a view can read PII **across organizations** because the view does not honor the caller's RLS policies.

### 1.2 In scope
- Migration `025_view_security_invoker.sql`: `ALTER VIEW ... SET (security_invoker = true)` on **all 22 views** (see §2.3 for the corrected inventory).

### 1.3 Out of scope (intentional — already shipped or YAGNI)
- RLS policy rewrite / anon revoke (done in `022`).
- `risk_level` enum (done in `024`).
- PII mask, open-redirect, security headers, login error, `NEXT_PUBLIC_` inline, `publishable_key` (done).
- Renaming `USE_MOCK` → `NEXT_PUBLIC_USE_MOCK` in `server.ts`. **Deliberately excluded:** `server.ts` runs server-side; `USE_MOCK` (non-`NEXT_PUBLIC_`) is the *correct* pattern — exposing the mock flag to the client bundle would be a regression.
- Optional minor cleanup of two `as any` sites in `server.ts` is LOW priority and may be dropped from the PR if it risks build breakage.

### 1.4 Superseded PRs (action for owner)
`gh` CLI is read-only on upstream for this fork, so the owner must close:
- **#24** — superseded entirely by `022_rls_hardening.sql`.
- **#29** — superseded entirely by `024_risk_level_enum.sql`.
- **#22** — superseded in bulk; this PR closes the final gap (view `security_invoker`) and supersedes #22 fully.

## 2. Technical Approach

### 2.1 Root cause
Postgres views default to running with the owner's privileges. In Supabase the view owner is a superuser-level role that bypasses RLS. When `authenticated` queries a view, the view's underlying tables are read **without** the caller's RLS policies applied → PII leaks across rows/orgs even though the base table has RLS enabled.

> Note: `022_rls_hardening.sql` revoked `anon` grants but **did not** touch view invoker semantics, and `019_grant_view_permissions.sql` had earlier granted `SELECT ON ALL TABLES` (which includes views) to `authenticated`. That grant still stands in `022` (which re-grants `SELECT ON ALL TABLES` to `authenticated`). So the leak path via views is open.

### 2.2 Fix — `security_invoker = true`
A single migration flips all 22 views to run with the **caller's** privileges, so RLS policies on the base tables are honored:

```sql
ALTER VIEW v_personnel_overview SET (security_invoker = true);
-- ... 22 views total
```

Properties:
- **Safe-by-default:** the view now respects caller RLS on every base table it reads.
- `authenticated` already holds `SELECT` (from `019`/`022`) → views remain queryable, but each row is filtered by policy.
- Supported on PG 15+; `supabase/config.toml` confirms `major_version = 15`.
- Idempotent: re-running sets the same option; no data/schema change.
- `service_role` is unaffected — it bypasses RLS by nature.

### 2.3 View inventory (22)
From `013_views.sql` (11):
`v_personnel_overview`, `v_org_dashboard`, `v_retirement_timeline`, `v_vacancy_analysis`, `v_high_risk_personnel`, `v_succession_status`, `v_training_summary`, `v_evaluation_history`, `v_active_alerts`, `v_workforce_composition`, `v_import_status`.

From `016_additional_views.sql` (9):
`v_critical_positions`, `v_succession_candidates`, `v_risk_distribution`, `v_org_risk_details`, `v_idp_summary`, `v_training_records`, `v_high_potential_personnel`, `v_org_vacancy_summary`, `v_critical_vacancies`.

From `021_add_burnout_risk.sql` (2):
`v_burnout_analysis`, `v_org_burnout_summary`.

> Corrected during Phase 0 pre-flight: grep of `CREATE ... VIEW` across all migrations surfaced 2 additional burnout views in `021` that the original count of 20 missed. All 22 must be flipped to close the leak path completely.

### 2.4 Test plan (real Supabase stack)
1. `supabase start` → run migrations `001`–`025` → seed.
2. Confirm PG version is 15 (`supabase status`).
3. As `authenticated` (with a policy that scopes to the caller's org): query each view → expect only rows the policy permits; assert no cross-org PII.
4. As `anon` / unauthenticated: query each view → expect blocked (`022` revoked `anon`).
5. As `service_role`: query each view → expect full data (bypass).
6. Smoke-test the dashboard pages that consume these views (e.g. `v_org_dashboard`, `v_personnel_overview`) → render normally, no empty state caused by over-restrictive policy.
7. `npm run lint`, `npx tsc --noEmit`, `npm run test:run` green.

### 2.5 PR strategy
- One PR from fork `Arnutt-N/hrisense` → upstream `nutchahrmoj/hrisense`, base `main`.
- Title: `fix(security): set security_invoker on views to honor caller RLS (closes #22)`.
- Body: reference #32, list superseded #24/#29, link this spec, include test plan checklist.
- Handoff comment on #32 (gitignored copy in `secrets/`) instructing owner to close #22/#24/#29.

## 3. Risks & Rollback

### 3.1 Risks
| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|-----------|
| R1 | Views aggregating across tables return too few rows once caller RLS applies → dashboard empty state | Medium | Medium | Verify base-table policies permit `authenticated` broadly enough; test dashboard flow end-to-end |
| R2 | Some base table lacks a policy → view returns 0 rows after invoker flip | Medium | Medium | Audit policies on every base table referenced by the 22 views; test multi-join views first (`v_org_dashboard`, `v_personnel_overview`, `v_burnout_analysis`) |
| R3 | Runtime PG < 15 despite `config.toml` → `ALTER VIEW SET` errors | Low | High | `supabase status` to confirm version before migration; fallback = ask owner to upgrade |
| R4 | Removing `as any` breaks TS build | Low | Low | Keep `as any` cleanup in a separate trailing commit; drop from PR if it fails |

### 3.2 Rollback
Migration `025` only changes a view option (no data/schema). Rollback:
```sql
ALTER VIEW v_personnel_overview RESET (security_invoker);
-- ... or SET (security_invoker = false) per view
```

### 3.3 Acceptance criteria
- [ ] migration `025` runs cleanly on local Supabase (PG 15)
- [ ] `authenticated` querying views sees only policy-permitted rows (no cross-org PII)
- [ ] `anon` querying views is blocked
- [ ] `service_role` bypasses RLS as before
- [ ] dashboard pages render normally
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run test:run` green
- [ ] PR opened from fork; #22 closed; owner notified to close #24/#29

## 4. Self-review notes
- Migration number `025` is free (001–024 used; `022` had a collision but is already taken, so `025` is the next clean slot).
- No new dependencies, no schema change, no data migration — purely a security config flip.
- The fix is the minimal change that closes the only remaining audit gap; everything else was de-duplicated against upstream.