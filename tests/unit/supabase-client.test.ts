import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock createBrowserClient เพื่อ capture options ที่ wrapper ส่งให้ @supabase/ssr
// — client.ts เป็น thin wrapper ดังนั้น "contract" ที่ทดสอบคือค่า options ที่ถูกต้อง
// ใช้ vi.hoisted เพราะ vi.mock factory ถูก hoist ขึ้นบนสุด (จะ access var ต่างหากไม่ได้)
const { createBrowserClientMock } = vi.hoisted(() => ({
  createBrowserClientMock: vi.fn(),
}))
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: createBrowserClientMock,
}))

vi.mock('@/lib/security/supabase-config', () => ({
  getSupabaseConfig: () => ({ url: 'https://x.supabase.co', anonKey: 'anon-key' }),
}))

vi.mock('@/lib/mock/client', () => ({
  createMockClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/client'

// รูปร่างของ call args ที่ wrapper ส่งให้ createBrowserClient(url, key, options)
type ClientCallOptions = { auth?: { persistSession?: boolean } }
type ClientCall = [string, string, ClientCallOptions]

function lastCallOptions(): ClientCallOptions {
  const calls = createBrowserClientMock.mock.calls as unknown as ClientCall[]
  return calls[calls.length - 1][2]
}

describe('createClient — session persistence (regression: login redirect ค้าง)', () => {
  // Regression guard: PR #40 เคยตั้ง auth.persistSession ตาม rememberSession
  // → เมื่อไม่ติ๊ก "จดจำฉัน" (default false) persistSession=false ทำให้ @supabase/ssr
  //   ไม่เขียน session cookie เลย → middleware ฝั่ง server มองไม่เห็น session
  //   → redirect กลับ /login วนลูป ค้างที่ "กำลังเข้าสู่ระบบ..." (reproduced บน prod)
  // Fix: persistSession ต้องเป็น true เสมอ เพราะ @supabase/ssr persist ผ่าน cookie

  beforeEach(() => {
    createBrowserClientMock.mockReset()
    createBrowserClientMock.mockReturnValue({ auth: {} })
    // USE_MOCK=false พอทำให้ client.ts ข้าม mock path (ไม่ต้องแตะ NODE_ENV)
    process.env.NEXT_PUBLIC_USE_MOCK = 'false'
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it('persistSession เป็น true เสมอ แม้ rememberSession=false (ค่า default ของ checkbox)', () => {
    createClient({ rememberSession: false })
    expect(lastCallOptions().auth?.persistSession).toBe(true)
  })

  it('persistSession เป็น true เมื่อ rememberSession=true', () => {
    createClient({ rememberSession: true })
    expect(lastCallOptions().auth?.persistSession).toBe(true)
  })

  it('persistSession เป็น true เมื่อไม่ระบุ option และ localStorage ไม่ได้ remember', () => {
    createClient()
    expect(lastCallOptions().auth?.persistSession).toBe(true)
  })
})
