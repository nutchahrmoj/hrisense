# Repository Guidelines

## Project Structure & Module Organization

HRiSENSE is a Next.js 14 App Router dashboard for workforce analytics. Main code lives in `src/`; do not add app code under the leftover `hrisense-app/` directory. Routes are grouped under `src/app/(auth)/` and `src/app/(dashboard)/`, with API routes in `src/app/api/`. Shared UI is in `src/components/`; utilities, Supabase clients, mock data, security helpers, and types are in `src/lib/`. Tests live in `tests/unit/*.test.ts` and `tests/e2e/*.spec.ts`. Supabase SQL migrations are in `supabase/migrations/`.

## Build, Test, and Development Commands

- `npm run dev` - start Next.js on `localhost:3000`.
- `npm run build` / `npm start` - build and serve production.
- `npm run lint` - run Next.js ESLint.
- `npx tsc --noEmit` - run TypeScript checks; this is not a package script.
- `npm run test` - run Vitest in watch mode.
- `npm run test:run` / `npm run test:coverage` - run unit tests once or with coverage.
- `npm run test:e2e` - run Playwright e2e tests; config starts/reuses the dev server locally.
- `npx supabase start` then `npx supabase db push` - start local Supabase and apply migrations.

## Local Machine Constraints

This workstation is company-managed and may lose local admin privileges. Prefer workflows that do not require elevated permissions. Do not assume Docker Desktop, local Supabase, or GUI/admin operations are available; use CI, hosted Supabase checks, or non-admin local commands when possible.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Prefer existing shadcn-style patterns and `@/*` imports. Keep UI Thai-first: `lang="th"`, Thai display strings, and Noto Sans Thai only. Use CSS variables from `src/app/globals.css` and Tailwind tokens; keep risk colors routed through `src/lib/utils/risk-colors.ts` and `RiskBadge`. Use Buddhist Era years for user-facing dates where the dashboard already does.

## Data, Auth, and Configuration

Query `v_*` views instead of base tables so mock and real Supabase paths match. Server data fetching should use `createServerSupabaseClient()`; browser code uses `createClient()`. Mock mode is split between `USE_MOCK` for server code and `NEXT_PUBLIC_USE_MOCK` for browser code. Real Supabase also needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. `src/middleware.ts` handles protected routes, auth redirects, login rate limiting, and mock-mode bypass outside production.

## Testing Guidelines

Vitest uses `jsdom`, `tests/setup.ts`, and files matching `tests/**/*.test.{ts,tsx}`. Playwright specs live in `tests/e2e/` and default to Chromium. Before finishing, run relevant tests plus `npx tsc --noEmit`; run `npm run build` for route, middleware, or config changes.

## Skills & AI Agent Conventions

This repo has several skill collections installed. Invoke the relevant skill **before** acting on a task if there is even a **1%** chance it applies — this is a hard rule, not a suggestion.

| Collection | Role | Commonly used skills in this project |
|---|---|---|
| **superpowers** | Process discipline (rigid — follow exactly) | `brainstorming`, `writing-plans`, `systematic-debugging`, `test-driven-development`, `verification-before-completion`, `executing-plans`, `using-git-worktrees`, `requesting-code-review` |
| **mattpocock** | Thinking/planning tools (TS/frontend) | `tdd`, `diagnosing-bugs`, `codebase-design`, `domain-modeling`, `prototype`, `resolving-merge-conflicts`, `grilling` |
| **supabase** | Any Supabase work (DB, Auth, RLS, CLI, MCP) | `supabase:supabase` |
| **frontend-design** | Build/adjust UI | `frontend-design` |

Current stack = `superpowers` + `mattpocock` (complementary: process ↔ thinking-tools). For the full comparison of all 5 collections (karpathy / superpowers / mattpocock / addyosmani / ecc) — layer model, pairwise overlaps, and stacking guidance — see [`docs/skill-collections-comparison.md`](docs/skill-collections-comparison.md).

## Commit & Pull Request Guidelines

Recent commits use Conventional Commit style, for example `fix(auth): ...` and `chore(secrets): ...`. Keep commits scoped and descriptive. PRs should explain the change, mention affected routes or migrations, link issues when relevant, include screenshots for UI changes, and call out required environment or Supabase migration steps.
