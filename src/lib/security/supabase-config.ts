/**
 * Reads + validates the public Supabase environment configuration.
 *
 * `createServerClient` from `@supabase/ssr` THROWS synchronously when either
 * the URL or the anon key is falsy:
 *
 *   "Your project's URL and Key are required to create a Supabase client!"
 *
 * In the Edge middleware that throw is uncaught (it sits outside the auth
 * try/catch) and turns EVERY request into a 500 — on Vercel this surfaces as
 * `X-Vercel-Error: MIDDLEWARE_INVOCATION_FAILED` and a blank page on the whole
 * site. Centralizing the presence check here lets callers fail gracefully
 * (e.g. return a clear config error) instead of crashing the runtime.
 *
 * Pass an explicit `env` in tests to avoid depending on `process.env` state.
 */
export interface SupabaseConfig {
  url: string
  anonKey: string
}

export function getSupabaseConfig(
  env: Record<string, string | undefined> = process.env
): SupabaseConfig | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  // Supabase renamed the public key from "anon" to "publishable" in newer
  // dashboards. Accept either name so a project configured with either works;
  // anon takes precedence when both are present.
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !anonKey) return null
  return { url, anonKey }
}
