import { NextResponse } from 'next/server'
import { recordLoginAttempt, getRemainingAttempts, getRetryAfterSeconds } from '@/lib/security/rate-limiter'

/**
 * POST /api/auth/login-attempt
 * Called by the login page on failed authentication to record the attempt.
 * Returns remaining attempts and retry-after info for the client.
 */
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  recordLoginAttempt(ip)

  const remaining = getRemainingAttempts(ip)
  const retryAfter = getRetryAfterSeconds(ip)

  return NextResponse.json({
    success: true,
    remaining,
    retryAfter,
    message: remaining === 0
      ? `พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณารอ ${Math.ceil(retryAfter / 60)} นาที`
      : `เหลืออีก ${remaining} ครั้งก่อนถูกล็อก`,
  })
}
