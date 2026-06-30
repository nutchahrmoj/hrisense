# Secrets Rotation & Audit — Design

**Date:** 2026-06-30
**Branch:** `chore/rotate-exposed-secrets`
**Trigger:** Supabase keys ใน `secrets/secret-keys.txt` เคยปรากฏใน conversation transcripts; ต้องการความปลอดภัยเชิงรุก

## Audit Results (Pre-Rotation)

### Tracked-files scan
สแกนไฟล์ทั้งหมดที่ track ใน git (head = `931c92d`) ด้วย patterns:

| Pattern | Match | Verdict |
|---|---|---|
| `eyJ[A-Za-z0-9_=.-]{50,}` (real JWT) | `kong.yml` lines 10, 13 | ✅ Placeholder (`anon-placeholder`, `service-placeholder`) |
| `sb_secret_*` / `sb_publishable_*` | 0 matches | ✅ ไม่พบ |
| `SUPABASE_SERVICE_ROLE_KEY=...` literal | 0 matches | ✅ ใช้ `${ENV_VAR}` แทน |
| `postgres://...:...@...` (connection string) | `docker-compose.prod.yml` | ✅ ผ่าน `${POSTGRES_PASSWORD}` |
| `service_role_secret` / `anon_public` names | 0 matches in tracked | ✅ — only in untracked `secrets/secret-keys.txt` (gitignored) |
| `.env.production.example` placeholders | real placeholders | ✅ |
| `docs/*.pptx` (eyJ) | 0 JWT contents | ✅ — only integrity hashes |
| `package-lock.json` (eyJ) | 1 match (`eyJIkqGIDMZPwPx24pUMfwSxxI8phr`) | ✅ — sha512 integrity hash, not a JWT |

**Conclusion:** Git history สะอาด — ไม่มี actual credentials leak ใน commit ใดๆ

### .gitignore audit
```
7	.claude/
8	secrets/
```
- `secrets/` อยู่ใน .gitignore บรรทัด 8 แล้ว ✅
- `.env.local` อยู่ในบรรทัด 3 ✅
- ❌ Missing: comment อธิบาย scope ของ secrets/ (อ่านยากสำหรับ contributor ใหม่)

## Rotated Keys

> ⚠️ ค่าต่อไปนี้ถูก rotate แล้ว — **อย่า expose ค่าเก่าใน commit/PR/log ใดๆ**

| Secret | Type | Storage |
|---|---|---|
| `SUPABASE_SECRET_KEY` | `sb_secret_*` | Supabase API Settings → Generate |
| `SUPABASE_SERVICE_ROLE_KEY` | JWT (service_role) | Supabase API Settings → Roll |
| `anon_public` (legacy) | JWT (anon) | Supabase API Settings → Roll |

**ไม่ rotate ในรอบนี้:**
- `sb_publishable_*` (publishable key) — เพราะ frontend ต้องไม่ break + ค่านี้เน้น public-by-design

## Implementation Sequence

1. Stop dev server (ถ้ามี)
2. Create `chore/rotate-exposed-secrets` branch จาก `main`
3. Backup `secrets/secret-keys.txt` → `secrets/.bak-rotated-2026-06-30.txt` (local only)
4. Rotate secret_key → paste ใหม่ลง secrets file
5. Rotate service_role JWT → paste ใหม่
6. Rotate anon_public JWT → paste ใหม่
7. `npm run build` (sanity check)
8. Provide new values for Vercel dashboard paste (by user)
9. Update `.gitignore` with explanatory comment
10. Commit + open PR (no secrets in diff)

## Risks

- **Prod impact:** การ rotate ค่าใน Supabase โดยไม่อัปเดต Vercel env จะทำให้ deploy ถัดไปใช้ค่าเก่า → ถ้าเก่า revoke แล้ว, services ที่ใช้จะ fail → **ต้อง update Vercel ทันทีหลัง rotate**
- **Vercel rollback:** Vercel has env var versioning; ถ้า paste ผิด, revert environment ได้ผ่าน deploy log
- **No DB schema changes** — rotation is pure ops

## Test Plan

1. `git status` clean + no `secrets/` in diff
2. `git log --diff-filter=A -- secrets/` ต้อง = 0
3. `npm run build` exit 0
4. Manual login (Playwright E2E reuse 1 check) → 200 OK + cookie set
