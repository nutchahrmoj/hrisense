import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database'
import { createMockServerClient } from '@/lib/mock/client'

/**
 * Cookie-based Supabase client that RESPECTS Row Level Security (RLS).
 *
 * Authenticates as the `authenticated` role using the logged-in user's session
 * cookie + the public anon key. Use this for ALL request-scoped reads/writes
 * (server components, route handlers) and for auth flows (exchangeCodeForSession,
 * session refresh) — the cookie store is what lets the session persist.
 */
export async function createAuthClient() {
  if (process.env.USE_MOCK === 'true') {
    return createMockServerClient() as any
  }

  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as any)
          )
        },
      },
    }
  )
}

/**
 * Backwards-compatible entry point used by server components for data fetching.
 *
 * SECURITY: this is now RLS-respecting. It previously returned a SERVICE-ROLE
 * client which bypassed RLS and exposed every row of PII (citizen_id, salary)
 * to any caller — see docs/SECURITY_AUDIT.md (CRITICAL C1). Do NOT restore the
 * service-role behavior here; use createServiceRoleClient() explicitly when a
 * privileged bypass is genuinely required.
 */
export const createServerSupabaseClient = createAuthClient

/**
 * Service-role Supabase client — BYPASSES Row Level Security.
 *
 * Use ONLY for trusted background/admin work that runs OUTSIDE a user request
 * (cron jobs, migrations, system-generated records). NEVER use this to serve
 * user-scoped data from a page or route handler.
 */
export function createServiceRoleClient() {
  if (process.env.USE_MOCK === 'true') {
    return createMockServerClient() as any
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  ) as any
}
