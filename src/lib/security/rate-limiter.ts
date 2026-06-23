/**
 * In-memory rate limiter for login attempts.
 * Defense-in-depth (M2) — Supabase already limits 30/hour per email,
 * but this adds IP-based protection against distributed brute-force.
 *
 * For production at scale, replace with Redis-based @upstash/ratelimit.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const loginAttempts = new Map<string, RateLimitEntry>()

const LOGIN_MAX_ATTEMPTS = 10 // per window
const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

let lastCleanup = 0
const CLEANUP_INTERVAL = 5 * 60 * 1000

function cleanupExpiredEntries() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [ip, entry] of loginAttempts) {
    if (now > entry.resetAt) loginAttempts.delete(ip)
  }
}

export function isRateLimited(ip: string): boolean {
  cleanupExpiredEntries()
  const now = Date.now()
  const entry = loginAttempts.get(ip)

  if (entry && now > entry.resetAt) {
    loginAttempts.delete(ip)
    return false
  }

  if (!entry) return false
  return entry.count >= LOGIN_MAX_ATTEMPTS
}

export function recordLoginAttempt(ip: string): void {
  const now = Date.now()
  const entry = loginAttempts.get(ip)

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
  } else {
    entry.count++
  }
}

export function getRemainingAttempts(ip: string): number {
  const entry = loginAttempts.get(ip)
  if (!entry || Date.now() > entry.resetAt) return LOGIN_MAX_ATTEMPTS
  return Math.max(0, LOGIN_MAX_ATTEMPTS - entry.count)
}

export function getRetryAfterSeconds(ip: string): number {
  const entry = loginAttempts.get(ip)
  if (!entry || Date.now() > entry.resetAt) return 0
  return Math.ceil((entry.resetAt - Date.now()) / 1000)
}
