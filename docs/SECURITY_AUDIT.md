# HRISENSE — Codebase Audit Report

> **วันที่:** 2026-06-21 · **ขอบเขต:** ~5,500 LOC (`src/` + `supabase/`)
> **วิธีตรวจ:** Multi-agent audit — 8 ECC reviewer agents อิสระ (Security, Database, React/Next.js, TypeScript, Accessibility, Performance, Silent-failure, Test coverage)
> **คำตัดสินรวม:** 🔴 **BLOCK — ห้าม deploy production จนกว่าจะปิด CRITICAL ทั้งหมด**

ระบบนี้จัดเก็บ PII ระดับสูง (เลขบัตรประชาชน, เงินเดือน, คะแนนความเสี่ยงบุคลากรรัฐ) พบช่องโหว่ที่ทำให้ข้อมูลเหล่านี้ **เข้าถึงได้โดยไม่ต้องยืนยันตัวตน**

---

## สรุปสถิติ

| สาขา | CRITICAL | HIGH | MEDIUM | LOW |
|------|:--:|:--:|:--:|:--:|
| Security | 4 | 3 | 2 | — |
| Database / Supabase | 4 | 6 | 6 | 4 |
| React / Next.js | 3 | 6 | 7 | — |
| Silent-failure / Error handling | 2 | 4 | 9 | 2 |
| Accessibility (WCAG 2.2 AA) | 3 | 11 | 8 | 4 |
| TypeScript | 0 | 6 | 6 | 2 |
| Performance | 0 | 4 | 3 | 3 |
| Test coverage | 4 gaps | 6 gaps | <5% coverage | — |

---

## 🚨 CRITICAL — ต้องแก้ก่อน deploy

### C1. PII ทั้งหมดเปิดสาธารณะ (ยืนยันโดย Security + Database + React + Silent-failure)

ปัญหาเดียวมาจาก **3 ชั้นทับซ้อน** ทำให้ `citizen_id` / `salary` ของทุกคนหลุดได้แม้ไม่ login:

| ชั้น | ไฟล์ | กลไกที่พัง |
|------|------|-----------|
| A. Service-role ทุก page | `src/lib/supabase/server.ts:14-18` | server components ใช้ client ที่สร้างด้วย `SERVICE_ROLE_KEY` → bypass RLS ทั้งระบบ |
| B. Views = SECURITY DEFINER | `supabase/migrations/013_views.sql`, `016_additional_views.sql`, `021_add_burnout_risk.sql` | view ไม่มี `security_invoker=true` → query ผ่าน view ข้าม RLS ของ base table |
| C. GRANT TO anon | `supabase/migrations/019_grant_view_permissions.sql:7` | `GRANT SELECT ... TO anon` → `GET /rest/v1/v_personnel_overview` ด้วย anon key ได้ข้อมูลทุกคนโดยไม่ต้อง auth |

**Exploit:** ยิง REST API ด้วย public anon key → ดึง `citizen_id`, `salary`, `email`, เบอร์โทร, คะแนนเสี่ยงของบุคลากรทั้งหมด

**แก้:**
1. server components → ใช้ `createAuthClient()` แทน service-role (สงวน service-role ไว้เฉพาะ background/admin job ที่ไม่ใช่ request ของ user)
2. `ALTER VIEW <view> SET (security_invoker = true);` ทุก view
3. `REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM anon;` แล้ว grant เฉพาะ `authenticated` เท่าที่จำเป็น
4. mask `citizen_id` / `salary` ใน `v_personnel_overview` สำหรับ non-admin

### C2. Auth callback ใช้ client ผิดประเภท (Security + React + Silent-failure)
`src/app/api/auth/callback/route.ts:10` ใช้ `createServerSupabaseClient()` (service-role, `persistSession:false`) เรียก `exchangeCodeForSession()` → **session cookie ไม่ถูกตั้ง** → login ล้มเหลวเงียบ
**แก้:** ใช้ `createAuthClient()` (cookie-based)

### C3. Open Redirect (Security + React)
`src/app/api/auth/callback/route.ts:7,13` — `next` param ไม่ validate → `?next=//evil.com` redirect ออกนอกเว็บหลัง login (phishing)
**แก้:**
```ts
const raw = searchParams.get('next') ?? '/dashboard'
const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/dashboard'
```

### C4. Mock mode ปิด auth ผ่าน public env (Security + React)
`src/middleware.ts:13` — `NEXT_PUBLIC_USE_MOCK==='true'` → ข้าม auth ทั้งหมด; prefix `NEXT_PUBLIC_` อยู่ใน client bundle และถ้าหลุดไป prod = เปิดทุก route
**แก้:** เปลี่ยนเป็น `USE_MOCK` (ไม่มี prefix) + guard `if (process.env.NODE_ENV === 'production') ignore`

### C5. Middleware ไม่มี error handling รอบ `getUser()` (Silent-failure)
`src/middleware.ts:39` — Supabase ล่ม = middleware throw → 500 ทุก protected route ไม่มี fallback
**แก้:** destructure `error`, ถ้า error และเป็น protected route → fail-safe redirect `/login`

### C6. RLS `organization_id IS NULL` → cross-tenant leak (Database)
`supabase/migrations/009_rls_policies.sql:78,145` — policy ของ `alerts` / `risk_assessments` ปล่อยให้ authenticated user ใดก็อ่าน row ที่ `organization_id IS NULL` ได้
**แก้:** เพิ่ม guard ตรวจ `personnel_id` ผ่าน `is_in_org_hierarchy()` แทนการปล่อยเมื่อ NULL

### C7. RLS helper เรียกแบบ per-row (Database)
`supabase/migrations/009_rls_policies.sql:51+` — `is_in_org_hierarchy()` ไม่ wrap `(SELECT ...)` → ประเมินซ้ำทุก row (300x profile lookup) — performance + correctness risk
**แก้:** wrap subselect / ใช้ `(SELECT auth.uid())` pattern เพื่อให้ planner hoist ได้

### C8. A11y critical (Accessibility)
`src/components/ui/badge.tsx:11` (Badge เป็น `<div>` ไม่มี role) · `src/app/(auth)/layout.tsx` (ไม่มี `<main>` landmark) · `src/app/error.tsx`, `src/app/(auth)/error.tsx` (SVG ไม่มี `aria-hidden`)

---

## 🟠 HIGH — ธีมที่พบซ้ำ

### Silent error swallowing ทั่ว codebase (Silent-failure + TypeScript)
pattern อันตรายสุด: server components แทบทุกตัวเขียน `const { data } = await supabase...` **ไม่ destructure `error`** → DB ล่มแสดงเป็น "ไม่มีข้อมูล" เหมือน empty state จริง
ไฟล์: `organizations/page.tsx:11`, `personnel/page.tsx:10`, `alerts/page.tsx:10`, `dashboard/retirement|risk|vacancy|succession|idp/page.tsx`, `organizations/[id]/page.tsx:12`
**แก้:** destructure `error` ทุก call + render error state (เหมือนที่ `dashboard/page.tsx` ทำบางส่วน)

### Type safety หลุด (TypeScript)
- `tsconfig.json:8` — `noImplicitAny:false` ขัด `strict:true`
- `src/lib/supabase/{client,server}.ts` — `as any` บน Supabase client แพร่ทั้ง codebase
- `next.config.js` — `typescript.ignoreBuildErrors:true` + `eslint.ignoreDuringBuilds:true` ปิด safety net
- `src/lib/mock/data.ts:284,463` — `any[]` return; `:289,457,469` — non-null `!` บน `.find()` ที่ runtime อาจ fail

### Auth/error handling (Silent-failure)
- `login/page.tsx:42-45` — mock path ไม่ `setLoading(false)`
- `login/page.tsx:70-83` — profile query error ถูกกลืน → role-based redirect หาย
- `app-header.tsx:16-24` — alert query error ไม่ตรวจ → alert count = 0 เงียบ
- `app-header.tsx:27-30` — `signOut()` error ไม่ตรวจ → session อาจไม่ถูก revoke แต่ user คิดว่า logout แล้ว

### Database HIGH
- `013_views.sql:11,45-46` — `citizen_id`/`salary` projected ให้ทุก viewer
- `021_add_burnout_risk.sql:127-152` — `calculate_burnout_risk()` เรียก per-row 2 ครั้งใน view
- `alerts/page.tsx:10`, `retirement/page.tsx:13` — query ไม่มี `.limit()`
- `010_functions.sql:526-528` — audit log เก็บ `citizen_id` plaintext JSONB
- `009_rls_policies.sql:46-47` — `salary_scales` อ่านได้ทุก authenticated user

### Security infra (Security)
ไม่มี security headers (CSP / HSTS / X-Frame-Options) ใน `next.config.js` · ไม่มี rate limiting บน auth · dashboard layout ไม่ verify session (พึ่ง middleware ชั้นเดียว — defense-in-depth หาย)

### Performance (Performance + Database)
- Recharts ไม่ใช้ `next/dynamic` (`charts/*.tsx:3`) → -130KB ได้
- `force-dynamic` ทุก route ไม่มี cache/revalidate
- `AppHeader` ยิง `v_active_alerts` ซ้ำทุก page (N+1 กับ dashboard page)
- query ไม่มี limit + filter ใน JS (`retirement/page.tsx:13`)
- `next.config.js` ขาด `experimental.optimizePackageImports`

### Accessibility (11 HIGH)
ตาราง `personnel/page.tsx`, `organizations/[id]/page.tsx` ขาด `scope="col"` · sidebar `<nav>` ไม่มี label + ไม่มี `aria-current` · hamburger button ไม่ทำงาน (`app-header.tsx:36`) · `RiskDistributionChart` ไม่มี `role="img"` · color-only risk indicators · alerts list ไม่ใช้ `<ul>/<li>`

### Test coverage <5% (Tests)
ไม่มี test เลยใน: `middleware.ts` (auth gate), `lib/validations/auth.ts` (Zod), `computeBurnout()`, `auth/callback` · `vitest.config.ts` ไม่มี coverage threshold (ผ่านเสมอ)
**Bug จาก gap:** `getRiskLevel()` ใน `risk-colors.ts` (`>80=critical`) ไม่ตรงกับ UI risk page (`75=critical`)

---

## 🟡 MEDIUM / LOW เด่นๆ

- **Data integrity:** enum `risk_level` ไม่มี `'critical'` แต่ seed/functions assign ค่านี้ (`001_extensions_and_enums.sql:12` vs `017`, `010`) → fail runtime
- `profiles.role` เป็น `VARCHAR` ไม่ใช่ enum `user_role` (`008_system_tables.sql:113`) → เสี่ยง typo ใน auth check
- `error.message` ดิบแสดงบน UI (`error.tsx` 3 ไฟล์) → info disclosure
- `date-fns` เป็น dead dependency (`package.json:24`)
- mutation ใน `succession/page.tsx:38-43` (ขัด immutability convention)
- หลาย `approved_by`/`created_by` UUID ไม่มี FK (`004_risk_tables.sql:131`)
- `config.toml` — `enable_signup=true`, `enable_confirmations=false` (เสี่ยงถ้า mirror ไป prod)
- A11y: progress bars ไม่มี `role="progressbar"`, color contrast `--muted-foreground` อาจต่ำกว่า 4.5:1, ขาด `aria-hidden` บน decorative icons

---

## ✅ ลำดับการแก้ที่แนะนำ

1. **ปิดรูรั่ว PII (C1)** — security_invoker + revoke anon + เลิก service-role ใน server components + mask PII → **ทำก่อนสุด เพราะข้อมูลกำลังหลุดจริง**
2. **แก้ auth flow (C2–C5)** — callback client, open redirect, mock guard, middleware error handling
3. **อุด RLS (C6, C7)** + แก้ enum mismatch (กัน data corruption)
4. **เปิด safety nets** — `ignoreBuildErrors:false`, ลบ `noImplicitAny:false`, เพิ่ม security headers
5. **เพิ่ม test ชั้น CRITICAL** — middleware, Zod, risk-scoring, burnout (พร้อมแก้ `getRiskLevel` threshold bug)
6. **Error handling pattern** — destructure `error` ทุก Supabase call + แสดง error state
7. **Performance + A11y** — dynamic import, caching, scope/aria fixes

---

## สิ่งที่ทำถูกต้องดีแล้ว (Positive)

RLS architecture ออกแบบดี (org hierarchy, policies ครบ — แต่ถูก bypass) · `html[lang="th"]`, skip link, `focus-visible`, `prefers-reduced-motion` ใน CSS · login/forgot-password forms มี `aria-invalid`/`aria-describedby` ครบ · `RetirementTrendChart` มี `role="img"` · dashboard table มี `<caption>`+`scope` · unit test ที่มีอยู่ตรวจ business invariants จริง

---

*รายงานนี้สร้างจากการตรวจอัตโนมัติแบบหลายมุมมอง — ก่อนแก้แต่ละข้อควรยืนยันบริบทจริงในโค้ดอีกครั้ง*
