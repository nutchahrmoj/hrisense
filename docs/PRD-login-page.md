# PRD: Login Page Feature — HRiSENSE

## 1. Overview

| Field | Value |
|-------|-------|
| **Product** | HRiSENSE — ระบบพยากรณ์และบริหารความเสี่ยงด้านกำลังคน |
| **Feature** | Login Page |
| **Branch** | `feature/add-login-page` |
| **Author** | Nutcha Anantawichian |
| **Date** | 2026-06-20 |
| **Status** | Reviewed |

---

## 2. Problem Statement

HRiSENSE is an internal HR risk management system for the Ministry of Justice (สำนักงานปลัดกระทรวงยุติธรรม). The current login page exists but needs improvement in the following areas:

- **No error handling UI** — login failures are silent (no user feedback)
- **No "forgot password" flow** — users cannot self-recover credentials
- **No input validation** — empty fields can be submitted
- **Default credentials exposed** — `admin@moj.go.th` / `password` are hardcoded as defaults (security risk in production)
- **No remember me / session persistence** options
- **No role-based redirection** — all users go to `/dashboard` regardless of role
- **No route protection** — unauthenticated users can access `/dashboard` directly
- **No accessibility support** — missing ARIA labels, keyboard navigation, screen reader support

---

## 3. Goals

| # | Goal | Success Metric |
|---|------|----------------|
| G1 | Secure authentication via Supabase Auth | Zero credential leaks in production |
| G2 | Clear error messages for failed logins | 100% of error states display Thai-language feedback |
| G3 | Input validation before submission | No empty/invalid submissions reach the API |
| G4 | Password reset flow | Users can reset password via email |
| G5 | Role-based redirection after login | Admin → `/dashboard`, Viewer → `/personnel` |
| G6 | Route protection via middleware | Zero unauthenticated access to protected routes |
| G7 | Accessibility compliance | WCAG 2.1 AA for login form |

---

## 4. User Stories

### 4.1 As a Ministry staff member
> I want to log in with my email and password so that I can access the HR risk dashboard.

**Acceptance Criteria:**
- [ ] Email field validates format before submission
- [ ] Password field is masked with toggle visibility
- [ ] Loading state shows during authentication
- [ ] Success → redirect to `/dashboard`
- [ ] Error → display Thai-language error message below form

### 4.2 As a user who forgot their password
> I want to reset my password via email so that I can regain access.

**Acceptance Criteria:**
- [ ] "ลืมรหัสผ่าน?" link below the login form
- [ ] Clicking opens a modal or navigates to `/forgot-password`
- [ ] User enters email → receives reset link via Supabase
- [ ] Reset link opens `/reset-password` page with new password form

### 4.3 As an admin
> I want to be redirected to the admin dashboard after login.

**Acceptance Criteria:**
- [ ] After login, check `role` from `profiles` table (joined via `user_id`)
- [ ] Role source: `public.profiles.role` column (enum: `admin`, `editor`, `viewer`)
- [ ] Admin role → `/dashboard`
- [ ] Other roles → `/personnel` (read-only view)
- [ ] If no profile found, redirect to `/personnel` (safe default)

### 4.4 As a developer
> I want the login page to work in mock mode for development.

**Acceptance Criteria:**
- [ ] `NEXT_PUBLIC_USE_MOCK=true` bypasses Supabase
- [ ] Mock mode shows visual indicator (already implemented)
- [ ] Mock mode uses a configurable delay to simulate network

### 4.5 As a security-conscious developer
> I want default credentials removed from production builds.

**Acceptance Criteria:**
- [ ] Remove `defaultValue` from email/password fields
- [ ] Use `NEXT_PUBLIC_DEFAULT_EMAIL` and `NEXT_PUBLIC_DEFAULT_PASSWORD` env vars for dev convenience only
- [ ] Env vars ignored when `NODE_ENV=production`
- [ ] Add CI check: no hardcoded credentials in production builds

---

## 5. Technical Requirements

### 5.1 Tech Stack
- **Framework:** Next.js 14.2 (App Router)
- **Auth:** Supabase Auth (`@supabase/ssr` + `@supabase/supabase-js`)
- **Styling:** Tailwind CSS
- **Validation:** Zod
- **Icons:** Lucide React

### 5.2 API Integration (Supabase SDK)
```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({ email, password })

// Password reset email
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${origin}/reset-password`
})

// Update password (after reset)
const { error } = await supabase.auth.updateUser({ newPassword })

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Get user role from profiles table
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('user_id', user.id)
  .single()
```

### 5.3 Files to Modify/Create

| File | Action | Description |
|------|--------|-------------|
| `src/app/(auth)/login/page.tsx` | Modify | Add validation, error UI, password toggle, remove default values |
| `src/app/(auth)/forgot-password/page.tsx` | Create | Password reset request form |
| `src/app/(auth)/reset-password/page.tsx` | Create | New password form after email link |
| `src/app/(auth)/layout.tsx` | Modify | Add shared error boundary |
| `src/middleware.ts` | Create | Auth guard — redirect unauthenticated users to `/login` |
| `src/lib/validations/auth.ts` | Create | Zod schemas for login/reset forms |
| `src/lib/supabase/client.ts` | Review | Ensure SSR-compatible client |
| `src/types/auth.ts` | Create | Role types and profile interface |

### 5.4 Password Complexity Rules
| Rule | Requirement |
|------|-------------|
| Minimum length | 8 characters |
| Uppercase | At least 1 (A-Z) |
| Lowercase | At least 1 (a-z) |
| Number | At least 1 (0-9) |
| Special char | Optional (recommended) |

Validation via Zod schema — enforced client-side and server-side.

### 5.5 Database / Supabase Config
- Enable "Email" provider in Supabase Dashboard
- Configure email templates in Thai language
- Set `SITE_URL` for password reset redirect
- Create `profiles` table:
  ```sql
  create table public.profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users on delete cascade unique,
    role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
    full_name text,
    created_at timestamptz default now()
  );
  -- RLS: users can read own profile
  alter table public.profiles enable row level security;
  create policy "Users can read own profile" on public.profiles
    for select using (auth.uid() = user_id);
  ```

---

## 6. UI/UX Requirements

### 6.1 Login Form Layout
```
┌─────────────────────────────┐
│         🛡️ HRiSENSE         │
│   ระบบพยากรณ์และบริหาร      │
│   ความเสี่ยงด้านกำลังคน     │
│                             │
│   ┌───────────────────┐     │
│   │ อีเมล             │     │
│   │ [_______________] │     │
│   └───────────────────┘     │
│   ┌───────────────────┐     │
│   │ รหัสผ่าน    👁️   │     │
│   │ [_______________] │     │
│   └───────────────────┘     │
│                             │
│   [   เข้าสู่ระบบ   ]     │
│                             │
│   ลืมรหัสผ่าน?             │
└─────────────────────────────┘
```

### 6.2 Error States
| Scenario | Message (Thai) |
|----------|---------------|
| Empty email | กรุณากรอกอีเมล |
| Invalid email format | รูปแบบอีเมลไม่ถูกต้อง |
| Empty password | กรุณากรอกรหัสผ่าน |
| Wrong credentials | อีเมลหรือรหัสผ่านไม่ถูกต้อง |
| Network error | ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ |
| Account locked | บัญชีถูกล็อก กรุณาลองใหม่ภายหลัง |

### 6.3 Responsive Design
- Mobile: Single column, full-width inputs
- Desktop: Centered card (max-w-md), as current

### 6.4 Accessibility (WCAG 2.1 AA)
- [ ] All form inputs have associated `<label>` elements
- [ ] Error messages use `aria-live="polite"` for screen reader announcement
- [ ] Focus management: focus moves to error message on validation failure
- [ ] Keyboard navigation: Tab order follows visual flow
- [ ] Password toggle button has `aria-label="แสดงรหัสผ่าน"` / `"ซ่อนรหัสผ่าน"`
- [ ] Loading state announced via `aria-busy="true"`
- [ ] Color contrast ratio ≥ 4.5:1 for all text
- [ ] Skip link: "ข้ามไปยังเนื้อหาหลัก" (not needed for login, but layout should support it)

### 6.5 Loading States
| State | UI |
|-------|-----|
| Initial page load | Skeleton placeholder for form |
| Submitting login | Button shows spinner + "กำลังเข้าสู่ระบบ..." |
| Checking session | Full-page spinner (middleware redirect) |
| Password reset sending | Button disabled + spinner |

---

## 7. Security Requirements

- [ ] Passwords never logged to console in production
- [ ] Rate limiting on login attempts (Supabase built-in: 30 attempts/hour)
- [ ] CSRF protection via Supabase SSR cookies
- [ ] No default credentials in production builds (`NODE_ENV=production` check)
- [ ] Password reset tokens expire after 1 hour
- [ ] Session tokens stored in httpOnly cookies (Supabase SSR default)
- [ ] Middleware blocks unauthenticated access to `/(dashboard)/*` routes
- [ ] Password complexity enforced via Zod (see 5.4)
- [ ] Auth events logged for audit trail (login success/failure, password reset)

### 7.1 Middleware Route Protection
```typescript
// src/middleware.ts
const protectedRoutes = ['/dashboard', '/personnel', '/alerts', '/settings']
const authRoutes = ['/login', '/forgot-password', '/reset-password']

export function middleware(request: NextRequest) {
  const session = request.cookies.get('sb-access-token')
  const isProtected = protectedRoutes.some(r => request.nextUrl.pathname.startsWith(r))
  const isAuth = authRoutes.some(r => request.nextUrl.pathname.startsWith(r))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (isAuth && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
```

### 7.2 Session Expiry Handling
| Scenario | Behavior |
|----------|----------|
| Token expires mid-session | Redirect to `/login` with flash message "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" |
| Refresh token fails | Clear cookies, redirect to `/login` |
| User navigates while expired | Middleware catches and redirects |

### 7.3 Audit Logging
Log the following events (to Supabase `auth_logs` table or external service):
- Login success (user_id, timestamp, ip)
- Login failure (email, timestamp, reason)
- Password reset request (email, timestamp)
- Password reset complete (user_id, timestamp)

---

## 8. Out of Scope (v1)

- OAuth / Social login (Google, Microsoft)
- Multi-factor authentication (MFA)
- SSO integration with MOJ systems
- Account registration (admin-only user creation)
- Session timeout configuration UI

---

## 9. Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Design & PRD | 1 day | This document |
| Implementation | 2 days | Login + validation + error UI |
| Password Reset | 1 day | Forgot/reset password flow |
| Role-based Redirect | 0.5 day | Post-login routing |
| Testing | 1 day | Unit + E2E tests (see 9.1) |
| Review & Deploy | 0.5 day | PR review + merge |

**Total: ~6 days**

### 9.1 Test Plan

**Unit Tests (Vitest):**
| Test | Input | Expected |
|------|-------|----------|
| Valid email | `user@moj.go.th` | Passes validation |
| Invalid email | `not-an-email` | Error: "รูปแบบอีเมลไม่ถูกต้อง" |
| Empty email | `""` | Error: "กรุณากรอกอีเมล" |
| Short password | `"abc"` | Error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" |
| Valid password | `"Passw0rd"` | Passes validation |
| Mock mode login | `NEXT_PUBLIC_USE_MOCK=true` | Redirects to `/dashboard` |

**E2E Tests (Playwright):**
| Test | Steps | Expected |
|------|-------|----------|
| Successful login | Enter valid creds → submit | Redirect to `/dashboard` |
| Invalid credentials | Enter wrong creds → submit | Error message displayed |
| Empty form submit | Click submit with empty fields | Validation errors shown |
| Password toggle | Click eye icon | Password visible/hidden |
| Forgot password link | Click "ลืมรหัสผ่าน?" | Navigate to `/forgot-password` |
| Protected route access | Visit `/dashboard` without session | Redirect to `/login` |
| Auth route with session | Visit `/login` with session | Redirect to `/dashboard` |

### 9.2 Rollback Plan
| Risk | Mitigation |
|------|------------|
| New login breaks production | Feature flag: `NEXT_PUBLIC_NEW_LOGIN=false` falls back to current UI |
| Middleware blocks legit users | Middleware is opt-in per route group; can disable by removing matcher |
| Password reset emails not sending | Supabase dashboard toggle; keep old "contact admin" fallback |

---

## 10. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| Q1 | What roles exist in Supabase? (admin, viewer, editor?) | Backend | Open |
| Q2 | Should we enforce password complexity rules? | Security | Open |
| Q3 | Do we need account lockout after N failed attempts? | Security | Open |
| Q4 | Email template language — Thai only or bilingual? | Product | Open |

---

## 12. References

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Current Login Page](src/app/(auth)/login/page.tsx)
- [Supabase Client](src/lib/supabase/client.ts)
