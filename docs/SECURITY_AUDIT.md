# Security Audit Report — HRiSENSE

**Date:** 2026-06-21
**Auditor:** Multi-agent codebase audit (PR #21)
**Scope:** Full codebase security review
**Status:** Remediation in progress (Issue #32)

---

## Executive Summary

This document records the findings from a comprehensive security audit of the HRiSENSE application. The audit covered authentication, authorization, data protection, HTTP security headers, error handling, and accessibility.

**Critical findings:** 4
**High findings:** 4
**Medium findings:** 3
**Low findings:** 2

---

## Findings

### CRITICAL

#### C1 — PII Exposure: Service Role Bypasses RLS
- **File:** `src/lib/supabase/server.ts`
- **Issue:** `createServerSupabaseClient()` uses `SUPABASE_SERVICE_ROLE_KEY`, completely bypassing all Row Level Security policies. All server-side data fetching runs as superuser with no per-user context.
- **Impact:** Any server component or API route can access all data regardless of user's organization or role.
- **Remediation:** Planned for future PR — requires switching server client to anon key with cookie-based auth, ensuring RLS is enforced on server queries.

#### C2 — Open Redirect in Auth Callback
- **File:** `src/app/api/auth/callback/route.ts`
- **Issue:** The `next` query parameter is used directly in redirect without validation. Attacker could craft `?next=https://evil.com` to redirect users after login.
- **Remediation:** ✅ Applied — validate `next` param to only allow same-origin relative paths.

#### C3 — Mock Mode Bypasses All Auth
- **File:** `src/lib/supabase/server.ts`, `src/middleware.ts`
- **Issue:** `USE_MOCK=true` bypasses all authentication including middleware route guards. If accidentally enabled in production, the entire auth system is disabled.
- **Remediation:** ✅ Applied — mock mode now requires `NODE_ENV !== 'production'`.

#### C4 — Middleware Auth Service Failure
- **File:** `src/middleware.ts`
- **Issue:** If `supabase.auth.getUser()` throws an error (network failure, service outage), the middleware crashes and could allow unauthenticated access to protected routes.
- **Remediation:** ✅ Applied — added try-catch with redirect to login on failure.

---

### HIGH

#### H1 — citizen_id Displayed in Plaintext
- **File:** `src/app/(dashboard)/personnel/[id]/page.tsx`
- **Issue:** Thai national ID (เลขบัตรประชาชน) is displayed in full on the personnel detail page. This is sensitive PII that should be masked.
- **Remediation:** ✅ Applied — masked to show only last 4 digits (XXX-XXX-Xnnnn).

#### H2 — No Security Headers
- **File:** `next.config.js`
- **Issue:** No HTTP security headers configured. Missing X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy, Permissions-Policy.
- **Remediation:** ✅ Applied — added baseline security headers in next.config.js.

#### H3 — Error Boundaries Leak Internal Details
- **Files:** `src/app/error.tsx`, `src/app/(auth)/error.tsx`, `src/app/(dashboard)/error.tsx`
- **Issue:** Error boundaries display `error.message` directly to users, which can leak internal implementation details, stack traces, or database errors.
- **Remediation:** ✅ Applied — replaced with static Thai error messages.

#### H4 — Broad SELECT Grant to Anonymous Role
- **File:** `supabase/migrations/019_grant_view_permissions.sql`
- **Issue:** Grants `SELECT ON ALL TABLES IN SCHEMA public TO anon`, which gives the anonymous role read access to every current and future table.
- **Remediation:** Planned — requires migration to revoke broad grants and add table-specific grants.

---

### MEDIUM

#### M1 — Missing RLS on Burnout Factors Table
- **File:** `supabase/migrations/021_add_burnout_risk.sql`
- **Issue:** `personnel_burnout_factors` table created without RLS enabled. Any authenticated user can read all burnout data regardless of organization.
- **Remediation:** Planned — requires migration to enable RLS and add org-scoped policies.

#### M2 — No Rate Limiting on Login
- **Issue:** No application-level rate limiting on login attempts. Relies solely on Supabase's built-in 30/hour limit.
- **Remediation:** ✅ Applied — IP-based rate limiter in middleware (10 attempts/15 min window) + API route for recording failed attempts.

#### M3 — Missing 'critical' Risk Level Enum
- **File:** `supabase/migrations/001_extensions_and_enums.sql`
- **Issue:** `risk_level` enum only has 'green', 'amber', 'red'. Application code already handles 'critical' but the database enum doesn't include it.
- **Remediation:** ✅ Applied — migration 024 adds 'critical' to the enum.

---

### LOW

#### L1 — Badge Semantics
- **File:** `src/components/ui/badge.tsx`
- **Issue:** Badge component uses `<div>` instead of `<span>`, which is semantically incorrect for an inline element.
- **Remediation:** ✅ Applied — changed to `<span>`.

#### L2 — Decorative SVGs Missing aria-hidden
- **Files:** Error boundary files
- **Issue:** Decorative SVG icons in error boundaries lack `aria-hidden="true"`, causing screen readers to announce them.
- **Remediation:** ✅ Applied — added `aria-hidden="true"` to all decorative SVGs.

---

## Remediation Status

| Finding | Severity | Status | PR |
|---------|----------|--------|-----|
| C1 — Service role bypass | Critical | 🔴 Planned | Future |
| C2 — Open redirect | Critical | ✅ Done | #23 |
| C3 — Mock mode bypass | Critical | ✅ Done | #23 |
| C4 — Middleware failure | Critical | ✅ Done | #23 |
| H1 — citizen_id plaintext | High | ✅ Done | #26 |
| H2 — No security headers | High | ✅ Done | #27 |
| H3 — Error message leak | High | ✅ Done | #28 |
| H4 — Broad anon grants | High | 🔴 Planned | Future |
| M1 — Burnout RLS missing | Medium | 🔴 Planned | Future |
| M2 — No rate limiting | Medium | ✅ Done | #30 |
| M3 — Missing critical enum | Medium | ✅ Done | #29 |
| L1 — Badge semantics | Low | ✅ Done | #25 |
| L2 — SVG aria-hidden | Low | ✅ Done | #25 |

---

## Remaining Work

### Future PRs (Ordered by Priority)

1. ~~**RLS hardening** — Switch server client from service role to anon key with cookie-based auth (C1)~~ ✅ Done
2. ~~**Revoke broad anon grants** — Replace `GRANT SELECT ON ALL TABLES TO anon` with table-specific grants (H4)~~ ✅ Done (migration 022)
3. ~~**Burnout RLS** — Enable RLS on `personnel_burnout_factors` with org-scoped policies (M1)~~ ✅ Done (migration 023)
4. ~~**Rate limiting** — Add login rate limiting at application level (M2)~~ ✅ Done
5. ~~**CSP headers** — Add Content-Security-Policy once all inline scripts are accounted for~~ ✅ Done

All identified security issues have been remediated.

---

## References

- [Issue #32 — Security Remediation Plan](https://github.com/nutchahrmoj/hrisense/issues/32)
- [PR #21 — Multi-agent Audit](https://github.com/nutchahrmoj/hrisense/pull/21)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
