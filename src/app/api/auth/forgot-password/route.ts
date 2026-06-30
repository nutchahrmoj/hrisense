import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { getSupabaseConfig } from '@/lib/security/supabase-config'
import {
  getRetryAfterSeconds,
  isRateLimited,
  recordLoginAttempt,
} from '@/lib/security/rate-limiter'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'พยายามหลายครั้งเกินไป กรุณารอแล้วลองใหม่' },
      {
        status: 429,
        headers: { 'Retry-After': String(getRetryAfterSeconds(ip)) },
      },
    )
  }

  recordLoginAttempt(ip)

  const body = await request.json().catch(() => null)
  const parsed = forgotPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const config = getSupabaseConfig()
  if (!config) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 },
    )
  }

  const supabase = createClient(config.url, config.anonKey, {
    auth: { persistSession: false },
  })

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: new URL('/reset-password', request.url).toString(),
  })

  if (error) {
    console.error('[forgot-password] reset email failed:', error.message)
  }

  return NextResponse.json({ success: true })
}
