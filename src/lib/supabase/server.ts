import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database'
import { createMockServerClient } from '@/lib/mock/client'

/**
 * Cookie-based server client — respects RLS policies.
 * Use this for all server-side data fetching (server components, API routes).
 */
export async function createServerSupabaseClient() {
  if (process.env.USE_MOCK === 'true' && process.env.NODE_ENV !== 'production') {
    return createMockServerClient() as any
  }

  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
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
 * Alias for createServerSupabaseClient — kept for backward compatibility.
 * Both return the same cookie-based anon-key client.
 */
export async function createAuthClient() {
  return createServerSupabaseClient()
}
