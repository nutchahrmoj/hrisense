/**
 * Reads + validates the public Supabase environment configuration.
 *
 * IMPORTANT — client-side inlining:
 * Next.js only inlines `process.env.NEXT_PUBLIC_*` into the browser bundle for
 * DIRECT literal accesses (e.g. `process.env.NEXT_PUBLIC_SUPABASE_URL`). It
 * does NOT inline accesses through an aliased reference such as
 * `const env = process.env; env.NEXT_PUBLIC_SUPABASE_URL` — in the browser the
 * runtime `process.env` is a stub, so the value is `undefined` and
 * `createClient()` throws "Supabase is not configured" even when the vars are
 * set. The server/Edge runtime has a real `process.env`, which is why this
 * only ever broke on the client (middleware redirected fine, login threw).
 *
 * So the default below reads each var via a direct `process.env.*` literal,
 * which Next.js replaces at build time. Pass an explicit `env` in tests to
 * override without depending on `process.env` state.
 *
 * Separately, `createServerClient` from `@supabase/ssr` THROWS synchronously
 * when either the URL or the anon key is falsy:
 *
 *   "Your project's URL and Key are required to create a Supabase client!"
 *
 * In the Edge middleware that throw is uncaught (it sits outside the auth
 * try/catch) and turns EVERY request into a 500 — on Vercel this surfaces as
 * `X-Vercel-Error: MIDDLEWARE_INVOCATION_FAILED` and a blank page on the whole
 * site when the project env vars weren't configured. Centralizing the presence
 * check here lets callers fail gracefully (e.g. return a clear config error)
 * instead of crashing the runtime.
 */
export interface SupabaseConfig {
  url: string
  anonKey: string
}

export function getSupabaseConfig(
  env?: Record<string, string | undefined>
): SupabaseConfig | null {
  const e =
    env ?? {
      // Direct literals — Next.js inlines these into the client bundle at
      // build time. Aliasing process.env to a variable would NOT be inlined.
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    }

  const url = e.NEXT_PUBLIC_SUPABASE_URL
  // Supabase renamed the public key from "anon" to "publishable" in newer
  // dashboards. Accept either name so a project configured with either works;
  // anon takes precedence when both are present.
  const anonKey = e.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? e.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !anonKey) return null
  return { url, anonKey }
}
