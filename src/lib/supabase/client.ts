import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'
import { createMockClient } from '@/lib/mock/client'
import { getSupabaseConfig } from '@/lib/security/supabase-config'

export function createClient() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return createMockClient() as any
  }

  const config = getSupabaseConfig()
  if (!config) {
    throw new Error(
      'Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in the environment.'
    )
  }

  return createBrowserClient<Database>(config.url, config.anonKey)
}
