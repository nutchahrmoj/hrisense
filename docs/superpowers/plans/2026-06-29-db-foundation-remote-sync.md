# PRP-Plan — DB Foundation: Sync Remote Supabase with Repo Migrations

**Date:** 2026-06-29
**Branch:** `fix/db-foundation-remote-sync`
**Spec:** `docs/superpowers/specs/2026-06-29-db-foundation-remote-sync-design.md`
**Project ref:** `euybvugftjbezklgmxuw` (https://hrisense.vercel.app)
**Method:** `supabase db push` (per user decision)

> **What this plan is:** bite-sized TDD-style tasks. Each task has exact commands, expected output, and a verification step that proves it worked. Verify before moving on.
>
> **What this plan is NOT:** the design rationale — that's in the spec above.

---

## Goal (from spec)

Bring the remote DB into sync with the repo's migrations so the data layer (functions, RLS policies, triggers, views) works. After this, an authenticated user (including admin) can read their scoped data and the app behaves correctly.

**Success criteria (must all pass at the end):**

1. `POST /rest/v1/rpc/is_admin` as the admin session → returns `true`.
2. `GET /rest/v1/profiles?id=eq.<admin-uuid>` as the admin session → returns `{"role":"admin"}`.
3. `GET /rest/v1/personnel?select=id&limit=1` as admin → 200.
4. Browser: login at https://hrisense.vercel.app as `admin@hrisense.local` → redirects to `/dashboard` and data renders.

---

## Pre-requisite — user must provide ONE of:

- **Option A (preferred):** Supabase access token from https://supabase.com/dashboard/account/tokens
- **Option B:** the project database password (from Supabase Dashboard → Settings → Database)

The value is passed as `SUPABASE_ACCESS_TOKEN` (or `--password` to `supabase link`) and is **never committed**. It lives in `secrets/secret-keys.txt` is already gitignored — add the token there if using A.

If user has not provided a token yet, **STOP at Task 2 and ask.**

---

## Conventions for every task

- All commands run from repo root `D:\hrisense` unless noted.
- Use **PowerShell** commands on this machine (Bash is also available for POSIX shells).
- After every task, the **Verify** step must succeed before moving on. If it fails, fix and re-verify — do not advance with a red task.
- Destructive operations (`db push` against prod) are gated on the prior task passing.
- Never log or echo the access token / password — mask it.

---

## Task 1 — Rename duplicate migration `022_seed_burnout_data.sql` → `025_seed_burnout_data.sql`

**Why:** Two migrations share prefix `022`. The CLI requires unique version numbers. Seed has no dependents on later migrations (it only needs `update_all_burnout_risks()` from `010_functions.sql` and the table from `021`). Renaming to `025` puts it after the burnout RLS hardening (`023`) and the enum change (`024`) — no risk of post-RLS ordering issues because the function is `SECURITY DEFINER` and runs as the migration role, not as `authenticated`.

**Files affected:** `supabase/migrations/022_seed_burnout_data.sql`

**Steps:**

1.1. `git mv supabase/migrations/022_seed_burnout_data.sql supabase/migrations/025_seed_burnout_data.sql`
1.2. Verify no other files reference the old path:
   ```
   grep -r "022_seed_burnout_data" supabase/ docs/ 2>$null
   ```
   Expected: **no matches**.
1.3. Verify the file's contents are unchanged (the rename must NOT alter SQL).

**Verify:**
- `ls supabase/migrations/` shows both `022_rls_hardening.sql` and `025_seed_burnout_data.sql`, and **no** `022_seed_burnout_data.sql`.
- `git status --short` shows `R  supabase/migrations/022_seed_burnout_data.sql -> supabase/migrations/025_seed_burnout_data.sql`.

**Commit:** `chore(db): rename 022_seed_burnout_data → 025 (resolve duplicate migration version)` on `fix/db-foundation-remote-sync`. Do **not** push yet — push after a couple tasks to avoid many small commits.

---

## Task 2 — Add Supabase access token to local secrets

**Why:** `supabase link` and `supabase db push` authenticate against the cloud either via an access token (Option A) or via the db password (Option B). Putting it in `.env` keeps it out of the repo.

**Steps:**

2.1. If using **Option A**, append one line to `secrets/secret-keys.txt`:
   ```
   SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxx
   ```
   If using **Option B**, add the db password the same way.

2.2. Export it for this shell session only (do NOT print):
   ```
   $env:SUPABASE_ACCESS_TOKEN = (Get-Content secrets/secret-keys.txt | Where-Object { $_ -match "^SUPABASE_ACCESS_TOKEN=" } ) -replace "^SUPABASE_ACCESS_TOKEN=", ""
   ```
   (Equivalent: `$env:SUPABASE_ACCESS_TOKEN = sbp_xxx…` directly.)

2.3. Sanity-check it's set without echoing:
   ```
   if ($env:SUPABASE_ACCESS_TOKEN) { "OK (length=$($env:SUPABASE_ACCESS_TOKEN.Length))" } else { "MISSING" }
   ```

**Verify:**
- Output is `OK (length=N)` where N > 20.
- The token value is never printed to terminal or committed to git.

**Rollback:** `Remove-Item Env:\SUPABASE_ACCESS_TOKEN` when done (Task 7).

---

## Task 3 — `supabase link` to remote project

**Why:** Establishes the local repo's binding to project ref `euybvugftjbezklgmxuw`. Writes `supabase/.temp/project-ref` (gitignored) so subsequent commands know where to push.

**Steps:**

3.1. Confirm supabase CLI is available:
   ```
   supabase --version
   ```
   Expected: prints a version like `1.x.y`. If not found, install: `npm i -g supabase` (or use `npx supabase`).

3.2. Link:
   ```
   supabase link --project-ref euybvugftjbezklgmxuw
   ```
   The CLI will prompt for the database password if using Option B. If using Option A, the env var is used.

3.3. When prompted "Update remote password for supabase? (Y/n)" — answer **n**. We don't want to write the password into the repo config; we just want the link.

**Verify:**
- Output ends with `Finished supabase link.`
- File `supabase/.temp/project-ref` exists and contains `euybvugftjbezklgmxuw`.
- `.gitignore` already covers `supabase/.temp/` — confirm:
  ```
   Select-String -Path .gitignore -Pattern "\.temp"
  ```

**If it fails with auth error:** the token / password is wrong. Re-run Task 2.

---

## Task 4 — `supabase migration list` to assess drift

**Why:** Before pushing, we need to see what the remote thinks is applied. The remote has the tables from 001-008, but the migration history table is unknown — it may be empty (no migrations ever recorded) or partial.

**Steps:**

4.1. Run:
   ```
   supabase migration list
   ```
4.2. Capture the output (copy to `docs/superpowers/plans/2026-06-29-drift-assessment.md` if useful).

**Verify (interpret the table):**
- The table has columns: `LOCAL`, `REMOTE`, `TIME`, `NAME`.
- For rows where `LOCAL` is the migration filename and `REMOTE` shows a `✓` (or status code), it's tracked as applied.
- For rows where `LOCAL` shows the migration and `REMOTE` shows blank or `—`, it's NOT tracked (so the table may or may not exist — CLI doesn't know).

**What we expect to see for this project:**
- All 24 (now 25 with renamed 025) migrations show `LOCAL` populated.
- Some subset show `REMOTE` populated (whatever the team manually applied), others blank.
- Specifically, 001-008 likely show `REMOTE` populated (per the diagnostic RPC `200` on all tables in the spec).
- 009-024 (and 025) likely show blank (the diagnostic that failed `is_admin()` confirms at least 009 not tracked).

**If the table is empty:** the remote was bootstrapped with no migration tracking. We'll need to mark 001-008 as already applied in Task 5.

---

## Task 5 — `supabase migration repair --status applied` for tables that already exist

**Why:** The remote has tables from 001-008 outside migration history. If we naively `db push`, the CLI will try to `CREATE TABLE` them and they already exist → error. Pre-marking them as `applied` tells the CLI to skip them and only apply the missing ones.

**Steps:**

5.1. For each migration `001_…` through `008_…` (8 migrations), mark it applied:
   ```
   supabase migration repair --status applied 001_extensions_and_enums 002_reference_tables 003_personnel_and_positions 004_risk_tables 005_planning_tables 006_history_tables 007_import_tables 008_system_tables
   ```
   (Use the migration's **version string** without the `.sql` suffix — matching what's in `supabase_migrations.schema_migrations.version`.)

5.2. Confirm with another `supabase migration list` — 001-008 should now show ✓ under REMOTE.

5.3. If `migration list` shows any additional migrations beyond 001-008 with `REMOTE ✓`, mark those too (use the same command with extra version strings).

**Verify:**
- `supabase migration list` now shows 001-008 (and any other previously-applied) as `REMOTE ✓` and 009-025 as not yet applied.

**If `migration repair` errors:** likely a permissions or RPC version mismatch — paste the error into the issue thread before trying anything else.

---

## Task 6 — `supabase db push` — apply the missing migrations

**Why:** This is the actual sync. The CLI applies 009 → 025 in order, each in its own transaction. Migrations are idempotent (they use `IF NOT EXISTS`, `CREATE OR REPLACE`, etc.), so re-running later is safe.

**Steps:**

6.1. Dry-run by passing `--dry-run` first if the CLI version supports it:
   ```
   supabase db push --dry-run
   ```
   Expected: prints the SQL that would run, then exits without applying. (Skip if `--dry-run` isn't supported on your CLI version — it isn't critical.)

6.2. Run for real:
   ```
   supabase db push
   ```
6.3. Watch for `ERROR` lines. Common ones:
   - `relation "X" already exists` → mark migration as applied (Task 5) and retry.
   - `function "X" already exists` → same — mark + retry.
   - `permission denied` → we're not running as superuser; the migration needs to be reworked to use `SECURITY DEFINER`. Pause and investigate.

**Verify (the real test):**
- The CLI prints `Finished supabase db push.` at the end (no `ERROR` lines).
- The push summary shows N migrations applied, where N = count of remote-not-applied migrations before the push (from Task 5).

**This is the destructive boundary.** If anything fails, do NOT re-push blindly — read the error, fix the migration (or mark drift), then retry.

---

## Task 7 — Functional verification (the spec's success criteria)

**Why:** Confirm the app data layer works after the push. The migration files claiming success isn't enough — the actual RLS + functions must resolve at request time.

**Steps:**

7.1. Issue an admin session token (re-using what we know works):
   ```
   curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" -H "apikey: $SUPABASE_ANON_KEY" -H "Content-Type: application/json" -d '{"email":"admin@hrisense.local","password":"<ADMIN_PASSWORD>"}'
   ```
   Extract `access_token` from the JSON response. Store in `$TOKEN`.

   (Use the admin password from the team's password manager — do not paste it into commit messages. The user has it from the prior session.)

7.2. **Verify success criterion #1 — `is_admin` RPC:**
   ```
   curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/is_admin" -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}'
   ```
   Expected: HTTP 200 with body `true` (or `[true]` depending on PostgREST version). **NOT** `PGRST202`.

7.3. **Verify success criterion #2 — profile self-read:**
   ```
   ADMIN_ID=befe4591-d4d8-4875-8697-f1104db62fa4
   curl -s "$SUPABASE_URL/rest/v1/profiles?id=eq.$ADMIN_ID&select=id,role,email" -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $TOKEN"
   ```
   Expected: HTTP 200 with `[{"id":"...","role":"admin","email":"admin@hrisense.local"}]`.

7.4. **Verify success criterion #3 — scoped read on personnel:**
   ```
   curl -s "$SUPABASE_URL/rest/v1/personnel?select=id&limit=1" -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $TOKEN"
   ```
   Expected: HTTP 200 with at least `[]` (admin sees all) or `[{"id":"..."}]` if seed has data and admin can see it. **NOT** 401/403.

7.5. **Verify success criterion #4 — browser login:**
   - Open https://hrisense.vercel.app/login
   - Log in as `admin@hrisense.local`
   - Confirm redirect to `/dashboard` (or wherever the role-based redirect sends admin)
   - Confirm the dashboard renders real data (not the empty state)

**Verify:**
- All four checks pass. If any fails, **STOP** and diagnose — don't move on with a partially-green verification.

**If 7.2 fails (`PGRST202` still):** the function isn't there. Check `supabase migration list` to see if 009 was actually applied. If yes, dump schema: `select proname from pg_proc where proname='is_admin';` via the service role.

---

## Task 8 — Commit, push, and open PR

**Why:** The branch must land before subsequent phases (the #32 roadmap PRs).

**Steps:**

8.1. Stage everything on this branch:
   ```
   git add -A
   git status
   ```
   Expected: only the renamed migration file (and any drift-assessment doc if you saved one). **No secrets.**

8.2. Commit (single commit, conventional message):
   ```
   chore(db): sync remote Supabase with repo migrations (009–025)
   ```
   Body should briefly note:
   - renamed `022_seed_burnout_data.sql` → `025_seed_burnout_data.sql`
   - applied migrations 009–025 via `supabase db push`
   - resolves the `is_admin()` blocker documented in the spec

8.3. Push:
   ```
   git push -u origin fix/db-foundation-remote-sync
   ```

8.4. Open a PR via `gh` (or tell the user the URL after push):
   ```
   gh pr create --base main --head fix/db-foundation-remote-sync --title "chore(db): sync remote Supabase with repo migrations (009–025)" --body-file <(cat <<'EOF'
   ## Why
   The remote Supabase project (`euybvugftjbezklgmxuw`) was missing all security/function-layer migrations. Without `is_admin()` the RLS policies couldn't resolve and every authenticated read returned nothing.

   ## What
   - Renamed `022_seed_burnout_data.sql` → `025_seed_burnout_data.sql` to resolve the duplicate version.
   - Applied migrations 009–025 to remote via `supabase db push`.

   ## Verified
   - `POST /rest/v1/rpc/is_admin` → `true` as admin session
   - `GET /rest/v1/profiles?id=eq.<admin>` → `{"role":"admin"}`
   - `GET /rest/v1/personnel?select=id&limit=1` → 200
   - Browser login as admin → dashboard renders
   EOF
   )
   ```

8.5. Clean up the local env var:
   ```
   Remove-Item Env:\SUPABASE_ACCESS_TOKEN -ErrorAction SilentlyContinue
   ```

**Verify:**
- PR is open on GitHub, CI is green.
- Local `git status` is clean (no uncommitted changes from the migration rename).

---

## Out-of-scope (deferred — listed to prevent scope creep during this PR's review)

- All code-level security fixes from issue #32 (PRs #22, #24, #29, #37 draft; #10, #11, #12, #13 to be created; perf work).
- Any application-code changes (this PR is DB-only).
- Changing the admin account.
- The publishable-key / client-bundle work (already merged: `7b1cf25`, `f5e6332`).

Each of those gets its own branch per the user's standing instruction ("always create a new branch before starting any new issue/task/phase").

---

## Rollback plan

If something goes catastrophically wrong on the remote:

1. **RLS over-tightened (everyone locked out):** temporarily disable RLS via the service role (`ALTER TABLE x DISABLE ROW LEVEL SECURITY;`) for each affected table, restore from a pre-push backup if one exists, or re-run the inverse of the problematic migration by hand. Discuss before doing.
2. **`db push` half-applied:** CLI applies each migration in its own transaction; failed migrations abort cleanly. Run `migration list` to see what landed, then re-push after fixing the broken migration.
3. **Wrong user authenticated as admin:** rotate the admin password via Dashboard → Authentication → Users.

The remote project has no CI yet that would auto-revert, so a bad push stays until manually fixed.

---

## Time / token budget

Estimated: **30–60 min** of focused work, mostly waiting on `db push` and verifying curl responses. Subagent fan-out is **NOT** appropriate for this phase — the work is sequential and depends on user-provided credentials. Run it inline; review at the end.
