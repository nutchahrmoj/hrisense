# แก้ปัญหา Vercel Production 404 (HRiSENSE)

> production `https://hrisense.vercel.app/` ขึ้น **404: NOT_FOUND** เพราะทุก deployment fail ที่ขั้นตอน **output detection** ทั้งที่ `next build` สำเร็จ

อัปเดต: 2026-06-20
สถานะ: แก้ Framework Preset เป็น Next.js แล้ว — เหลือ Redeploy เพื่อ apply

---

## 1. สาเหตุที่แท้จริง (ยืนยันจาก build log)

`next build` **สำเร็จทุกอย่าง** (compile ผ่าน, 18/18 หน้า, route table ออกครบ) แต่หลัง build เสร็จ Vercel error:

```
Error: No Output Directory named "public" found after the Build completed.
Configure the Output Directory in your Project Settings.
Alternatively, configure vercel.json#outputDirectory.
```

**สาเหตุ: Vercel project ถูก import เป็น Framework Preset = "Other" (ไม่ใช่ "Next.js")**

- Preset = **"Other"** → Vercel คิดว่าเป็น static site → หา output ในโฟลเดอร์ `public/` → ไม่เจอ → fail → ไม่มี production build → **404**
- Preset = **"Next.js"** → Vercel รู้ว่า output อยู่ที่ `.next` และตั้ง serverless functions + routing ให้อัตโนมัติ

---

## 2. วิธีแก้

### ✅ ทาง A — Dashboard (เร็วสุด แนะนำ)

ใน **Project → Settings → Build and Deployment → "Framework Settings"**:

1. **Framework Preset** → ตั้งเป็น **"Next.js"** (ปล่อย Override ของ Build Command / Output Directory / Install Command เป็น OFF = ใช้ default ของ Next.js)
2. **Save**
3. ⚠️ การเปลี่ยน Project Settings **ไม่ apply ย้อนหลัง** — มีผลกับ deployment ครั้งถัดไปเท่านั้น
จึงต้อง **Deployments → ⋯ → Redeploy** (ติ๊กออก "Use existing Build Cache")

---

> ถ้าเห็น warning "Configuration Settings in the current Production deployment differ from your current Project Settings" + Production Override = "Other" แปลว่า preset แก้แล้วแต่ deployment ที่ live ยังเป็นตัวเก่า → Redeploy คือก้าวสุดท้าย

### 🟢 ทาง B — Repo-level (`vercel.json`) — กันพลาดในอนาคต

ไฟล์ `vercel.json` ที่ root ระบุ framework ให้ชัด เพื่อ override การ detect ผิด แม้สร้าง project ใหม่:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs"
}
```

> สำหรับ Next.js **ไม่ต้อง** ตั้ง `outputDirectory` — ปล่อยให้ framework จัดการ `.next` เอง

---

## 3. Checklist หลังแก้

- [ ] Build log เห็น `Detected Next.js version: 14.2.0` และ `Running "next build"` (ใช้เวลาหลายสิบวินาที ไม่ใช่จบใน < 1s)
- [ ] Redeploy แล้ว build จบด้วย success (ไม่มี `No Output Directory named "public"`)
- [ ] Deployment เปลี่ยนจาก `failure` เป็น `success`
- [ ] เปิด `https://hrisense.vercel.app/` แล้ว redirect ไป `/login` (ไม่ใช่ 404)
- [ ] ตั้ง Environment Variables ของ Supabase ใน Vercel ครบ (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)

---

## 4. หมายเหตุ (คนละเรื่องกับ 404 นี้)

- **โค้ด build ผ่าน** — รัน `npm ci && npm run build` ในเครื่องสำเร็จ 18/18 หน้า ปัญหาเป็น Vercel config ล้วนๆ
- GitHub Actions `deploy.yml` ที่เคย fail (secrets-in-`if:`) เป็นคนละปัญหา แก้แล้วใน commit `0a26639` — Vercel deploy ทำผ่าน **Git integration** ไม่ใช่ GitHub Actions
- `next.config.js` มี `eslint.ignoreDuringBuilds` + `typescript.ignoreBuildErrors` เป็น safety net โดยให้ `ci.yml` เป็น gate ตรวจ lint/type แทน (เห็นใน build log ว่า "Skipping validation of types / Skipping linting")
