import { describe, it, expect } from 'vitest'

import { getSupabaseConfig } from '@/lib/security/supabase-config'

describe('getSupabaseConfig', () => {
  // Regression guard: createServerClient (@supabase/ssr) throws synchronously
  // when URL/key are falsy. In the Edge middleware that throw is uncaught and
  // turns every request into a 500 (Vercel: MIDDLEWARE_INVOCATION_FAILED →
  // blank page). This helper centralizes the presence check so callers can
  // fail gracefully instead of crashing.

  it('คืน null เมื่อขาด NEXT_PUBLIC_SUPABASE_URL', () => {
    expect(getSupabaseConfig({ NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key' })).toBeNull()
  })

  it('คืน null เมื่อขาด NEXT_PUBLIC_SUPABASE_ANON_KEY', () => {
    expect(
      getSupabaseConfig({ NEXT_PUBLIC_SUPABASE_URL: 'https://x.supabase.co' })
    ).toBeNull()
  })

  it('คืน null เมื่อขาดทั้งคู่', () => {
    expect(getSupabaseConfig({})).toBeNull()
  })

  it('คืน null เมื่อ URL เป็น empty string (falsy)', () => {
    expect(
      getSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      })
    ).toBeNull()
  })

  it('คืน null เมื่อ anon key เป็น empty string (falsy)', () => {
    expect(
      getSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: 'https://x.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
      })
    ).toBeNull()
  })

  it('คืน config เมื่อมีครับทั้งคู่', () => {
    expect(
      getSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: 'https://x.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      })
    ).toEqual({ url: 'https://x.supabase.co', anonKey: 'anon-key' })
  })
})
