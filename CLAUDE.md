# CLAUDE.md — คู่มือสำหรับ AI agent ในโปรเจค HRiSENSE

> ไฟล์นี้ Claude (และ AI agent อื่นๆ) อ่านอัตโนมัติทุกครั้งที่เริ่มทำงานใน repo นี้
> เนื้อหาเป็น **instructions** ที่ override พฤติกรรม default — ต้องทำตามทุกข้อ

---

## 🗣️ 1. ภาษาและโทนการสื่อสาร (สำคัญที่สุด)

| ข้อ | ให้ทำ |
|---|---|
| ภาษาหลัก | **ไทย** — ตอบ อธิบาย สรุป เป็นไทย |
| ศัพท์เทคนิค | ใช้ **อังกฤษ** (เช่น migration, RLS policy, JWT, trigger, middleware) แล้ว **อธิบายความหมาย** ต่อท้ายในวงเล็บ 1 บรรทัด |
| ระดับคนอ่าน | **มือให้มือใหม่** — สมมติผู้อ่านเพิ่งเริ่ม อธิบาย **"ทำไม"** (why) ไม่ใช่แค่ **"ทำยังไง"** (how) |
| รูปแบบ | **Tutorial-style** — แบ่งเป็นขั้นตอน มีคำสั่ง + ผลลัพธ์ที่คาดหวัง ใช้ตาราง/ลิสต์ให้อ่านง่าย |
| ความกระตือรือร้น | **เสนอแนะเพิ่มเติม** (best practice, ทางเลือก, สิ่งที่ควรระวัง) แต่ **ถามก่อนทำ** สิ่งที่ destructive หรือยากแก่การย้อนกลับ |
| ความยาว | ละเอียดพอให้เข้าใจ แต่ไม่ยืดเยื้อ — ใช้หัวข้อย่อยแบ่ง |

**ตัวอย่างโทนที่ถูกต้อง:**
> ✅ "Apply migration 009 แล้ว (migration = ไฟล์สคริปต์ที่เปลี่ยนโครงสร้าง DB) — สร้างฟังก์ชัน `is_admin()` (ฟังก์ชันเช็คว่าผู้ใช้ปัจจุบันเป็น admin หรือไม่) และ 52 RLS policies (กฎควบคุมว่าใครอ่าน/แก้แถวไหนได้) ผลคือ login ที่พังมาก่อนหน้านี้เริ่มทำงานได้แล้ว"

---

## 📋 2. โปรเจค HRiSENSE คืออะไร

ระบบ HR (ทรัพยากรบุคคล) สำหรับวิเคราะห์ **ความเสี่ยงของบุคลากร** — เกษียณ ย้ายงาน สืบทอดตำแหน่ง และ burnout (ความเหนื่อยล้าจากงาน)

| ส่วน | ค่า |
|---|---|
| Stack | Next.js 14 (App Router) + Supabase (Postgres + Auth) + TypeScript |
| Deploy | https://hrisense.vercel.app — deploy จาก branch `main` ทุก push |
| Repo | github.com/nutchahrmoj/hrisense |
| Remote Supabase | project ref `euybvugftjbezklgmxuw` (ap-northeast-1, Postgres 17) |
| Local dev | `.env.local` → Supabase local (Docker 127.0.0.1:54321) + `USE_MOCK=true` |

---

## 🔒 3. กฎเหล็ก (Conventions — ทำตามเสมอ)

1. **task / issue / phase ใหม่ทุกครั้ง → สร้าง branch ใหม่เสมอ** (กฎผู้ใช้)
2. **commit / push เฉพาะเมื่อผู้ใช้สั่ง** — ปกติไม่ push เอง
3. **Secrets ห้าม commit** — service role key, db password, access tokens เก็บใน `secrets/secret-keys.txt` (gitignore แล้ว)
4. **ก่อนลบ/เขียนทับไฟล์ที่ไม่ได้สร้างเอง** → แจ้งผู้ใช้ก่อนเสมอ
5. **Verify ก่อน claim เสร็จ** — รันคำสั่ง ดูผลจริง แล้วค่อยพูดว่าเสร็จ (ดู skill `verification-before-completion`)

---

## 🗄️ 4. การจัดการฐานข้อมูล Supabase

- **Migrations** อยู่ใน `supabase/migrations/` เรียงตามเลข (`001_`, `002_`, ...)
- **Apply migration ไป remote** ใช้ MCP tool `execute_sql` ของ plugin `supabase` ระบุ `project_id="euybvugftjbezklgmxuw"` (run เป็น superuser ข้าม RLS ได้)
- **App API keys (service role/anon) รัน DDL ไม่ได้** — สร้าง table/function/policy ผ่าน REST API ไม่ได้ ต้องใช้ MCP `execute_sql` หรือ CLI หรือ Dashboard SQL Editor
- **`.mcp.json`** pin `project_ref` ไว้แล้ว (project-scoped) — commit แชร์ทีมได้ ไม่มี secret

### ⚠️ Gotcha: Next.js NEXT_PUBLIC inlining
`process.env.NEXT_PUBLIC_*` ถูกแทนค่า (inline) เข้า browser bundle **เฉพาะตอนเข้าถึงแบบ direct literal** (`process.env.NEXT_PUBLIC_X`) — ถ้าเข้าถึงผ่าน alias (`const env = process.env; env.NEXT_PUBLIC_X`) ฝั่ง client จะเป็น `undefined` เพราะ browser ไม่มี `process.env` จริง เคยทำให้ login พัง (แก้ใน commit `7b1cf25`)

---

## 🛠️ 5. Skills ที่เกี่ยวข้อง (ใช้เมื่อ task ตรง)

> 🔒 **กฎเหล็ก:** ถ้ามีโอกาสแม้ **1%** ว่า skill ไหนเกี่ยวข้อง ต้อง **invoke ก่อนทำ** — กฎนี้ครอบทุก collection ไม่ใช่แค่ superpowers

### Skills ที่ติดตั้งใน HRiSENSE

| Collection | หน้าที่ | Skills ที่ใช้บ่อยในโปรเจค |
|---|---|---|
| **superpowers** | วินัยกระบวนการ (rigid = ทำตามเป๊ะ) | `brainstorming`, `writing-plans`, `systematic-debugging`, `test-driven-development`, `verification-before-completion`, `executing-plans`, `using-git-worktrees`, `requesting-code-review` |
| **mattpocock** | เครื่องมือคิด/วางแผน (TS/frontend) | `tdd`, `diagnosing-bugs`, `codebase-design`, `domain-modeling`, `prototype`, `resolving-merge-conflicts`, `grilling` |
| **supabase** | งาน Supabase ทุกชนิด (DB, Auth, RLS, CLI, MCP) | `supabase:supabase` |
| **frontend-design** | สร้าง/ปรับ UI | `frontend-design` |

> 📊 **Stack ปัจจุบัน** = `superpowers` + `mattpocock` (เสริมกัน: process ↔ thinking-tools, เหมาะกับ TS/frontend หนัก) — ดูเปรียบเทียบครบทั้ง 5 collections (karpathy/superpowers/mattpocock/addyosmani/ecc), layer model, ความทับซ้อน, คำแนะนำการ stack ได้ที่ [`docs/skill-collections-comparison.md`](docs/skill-collections-comparison.md)

---

## 📝 6. การเขียน prompt ที่มีประสิทธิภาพ (สำหรับผู้ใช้)

เมื่อสั่งงาน Claude ในโปรเจคนี้ ให้ผลลัพธ์ดีที่สุด:
1. **ระบุเป้าหมาย + ข้อจำกัด** — "ทำ X โดยไม่กระทบ Y"
2. **บอกวิธี verify** — "เช็คด้วยว่า login สำเร็จ"
3. **ระบุ branch ถ้าสำคัญ** — "บน branch `fix/db-foundation`"
4. **แยก task เล็กๆ** — ทีละข้อดีกว่าทำรวมก้อนใหญ่
5. ใช้คำสั่ง **fan out agents** เมื่อต้องการ parallelism / multi-perspective review
