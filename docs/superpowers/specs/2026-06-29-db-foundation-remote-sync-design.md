# DB Foundation — Sync Remote Supabase with Repo Migrations

**Date:** 2026-06-29
**Branch:** `fix/db-foundation-remote-sync`
**Status:** Design (awaiting review)

## Problem

The production remote Supabase project (`euybvugftjbezklgmxuw`, serving https://hrisense.vercel.app) is missing the entire security/function layer of the schema. Diagnosis (read-only, via REST + service key):

| Repo migration group | On remote | Evidence |
|---|---|---|
| 001–008 (all 29 tables) | ✅ present | every table returns HTTP 200 |
| 009 (RLS policies + `is_admin` / `is_in_org_hierarchy` helpers) | ❌ missing | `rpc/is_admin` → `PGRST202` (not found) |
| 010 (functions: risk calc, audit, occupancy) | ❌ missing | `rpc/*` for all 6 probed functions → `PGRST202` |
| 011 (triggers) | ❌ presumed missing | depends on 010 functions |
| 012–024 (indexes, views, seed, burnout, enum) | ❓ unverified | |

**Impact:** with `is_admin()` absent, RLS policies cannot evaluate, so every authenticated data read is blocked. Login succeeds (auth issues a valid session) but the app shows no data and the admin lands on the wrong page. This breaks the app for **all** users, not just admin.

Additionally, the admin account was created during this work (`admin@hrisense.local`, profile `role='admin'`, user id `befe4591-…`); auth works, only the data layer is broken.

## Goal

Bring the remote DB into sync with the repo's migrations so the data layer (functions, RLS policies, triggers, views) works. After this, an authenticated user (including admin) can read their scoped data and the app behaves correctly.

## Non-goals (out of scope for this phase)

- Code-level security PRs from issue #32 roadmap (#22, #24, #29, #37, and the not-yet-created #10/#11/#12/#13/perf). Deferred to later phases/branches.
- Changing the admin account.
- The publishable-key / client-bundle work (already merged: `7b1cf25`, `f5e6332`).

## Approach

Use the Supabase CLI to apply the missing migrations: `supabase link` → assess drift → `supabase db push`. The CLI tracks applied migrations (`supabase_migrations.schema_migrations`) and applies only what's missing, in dependency order. This is the robust choice given the gap spans ~16 migrations.

**Prerequisite (user must provide):** a Supabase access token (Dashboard → Account Settings → Access Tokens) **or** the project's database password, so `supabase link --project-ref euybvugftjbezklgmxuw` can authenticate.

## Pre-flight repo fixes (must do before `db push`)

1. **Resolve duplicate migration version `022`.** Two files share prefix `022`: `022_rls_hardening.sql` (from PR #24) and `022_seed_burnout_data.sql`. The CLI requires unique version numbers. Plan: rename `022_seed_burnout_data.sql` → `025_seed_burnout_data.sql` (seed has no dependents; runs as superuser so post-RLS ordering is fine). Verify dependencies by reading each burnout migration during implementation.

## Open decision: seed data in production

Migrations `017_comprehensive_seed_data.sql` and (renamed) `025_seed_burnout_data.sql` insert **sample/demo** personnel. Applying them to the production remote populates demo data. Two options:
- **Include** — production gets demo data (useful for a pre-launch / demo deploy).
- **Exclude** — rename these to `.bak` (like `014`/`015` already are) so `db push` skips them; production stays empty of demo data.

**Recommendation: exclude** (`.bak`) for a real production deploy; the user decides.

## Execution (high-level — detailed in PRP-Plan)

1. Resolve the `022` duplicate (rename seed → `025`) on this branch.
2. Decide seed inclusion (above); `.bak`-rename if excluding.
3. `supabase link --project-ref euybvugftjbezklgmxuw` (user provides token / db password).
4. `supabase migration list` — see what the remote has tracked vs. local.
5. **Drift handling:** the remote has tables 001–008 but its migration-tracking state is unknown. If `db push` reports conflicts (tables already exist), reconcile — likely by marking 001–008 as already applied (`supabase migration repair --status applied ...`) so only 009+ get applied.
6. `supabase db push` — apply the missing migrations.
7. Commit repo changes (renamed migrations) on this branch → PR.

## Risks

- **Drift / untracked tables:** remote tables exist outside migration history → `db push` may try to re-create them and error. Mitigation: `migration list` + `migration repair` to mark applied set before pushing.
- **Migration ordering:** the burnout block (021/022/023) and the `022` duplicate. Mitigation: read each migration, fix order, unique versions.
- **RLS lockout:** if policies apply but `is_admin()` somehow doesn't, reads stay blocked. Mitigation: `is_admin()` is defined inside 009 before the policies that use it, so they apply together.
- **Seed in prod:** addressed by the open decision above.

## Verification (success criteria)

All checked against the live remote after `db push`:
1. `POST /rest/v1/rpc/is_admin` as the admin session → returns `true` (function exists + resolves).
2. `GET /rest/v1/profiles?id=eq.<admin>` as the admin session → returns `{"role":"admin"}` (RLS self-read works).
3. `GET /rest/v1/personnel?select=id&limit=1` as admin → 200 (scoped read works, not blocked).
4. Browser: log in at https://hrisense.vercel.app as `admin@hrisense.local` → redirected to `/dashboard` and data renders.

## Notes

- The service-role key cannot run DDL; that's why CLI `db push` (or Dashboard SQL) is required. The user chose CLI.
- Per project constraint: this phase runs on its own branch; subsequent phases (the #32 roadmap PRs) each get their own branch.
