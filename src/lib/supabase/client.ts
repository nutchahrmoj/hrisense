import { createBrowserClient } from '@supabase/ssr'
import type { CookieMethodsBrowser, CookieOptions } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'
import { createMockClient } from '@/lib/mock/client'
import { getSupabaseConfig } from '@/lib/security/supabase-config'

type BrowserClientOptions = {
  rememberSession?: boolean
}

function serializeCookie(name: string, value: string, options: CookieOptions = {}) {
  let cookie = `${encodeURIComponent(name)}=${value}`

  if (typeof options.maxAge === 'number') cookie += `; Max-Age=${options.maxAge}`
  if (options.expires) cookie += `; Expires=${options.expires.toUTCString()}`
  if (options.path) cookie += `; Path=${options.path}`
  if (options.domain) cookie += `; Domain=${options.domain}`
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`
  if (options.secure) cookie += '; Secure'

  return cookie
}

function getDocumentCookies() {
  return document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .map((cookie) => {
      const separatorIndex = cookie.indexOf('=')
      const name = separatorIndex >= 0 ? cookie.slice(0, separatorIndex) : cookie
      const value = separatorIndex >= 0 ? cookie.slice(separatorIndex + 1) : ''

      return {
        name: decodeURIComponent(name),
        value,
      }
    })
}

function createSessionCookieMethods(): CookieMethodsBrowser {
  return {
    getAll: getDocumentCookies,
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        const sessionOptions: CookieOptions = {
          ...options,
          maxAge: value ? undefined : 0,
          expires: undefined,
        }

        document.cookie = serializeCookie(name, value, sessionOptions)
      })
    },
  }
}

export function createClient(options: BrowserClientOptions = {}) {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true' && process.env.NODE_ENV !== 'production') {
    return createMockClient()
  }

  const config = getSupabaseConfig()
  if (!config) {
    throw new Error(
      'Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in the environment.'
    )
  }

  let rememberSession = options.rememberSession
  if (rememberSession === undefined && typeof window !== 'undefined') {
    rememberSession = window.localStorage.getItem('hrisense:remember-login') === 'true'
  }
  if (rememberSession === undefined) {
    rememberSession = true
  }

  return createBrowserClient<Database>(config.url, config.anonKey, {
    isSingleton: rememberSession !== false,
    cookies: rememberSession === false
      ? createSessionCookieMethods()
      : undefined,
    auth: {
      persistSession: rememberSession !== false,
      storage: rememberSession === false
        ? (typeof window !== 'undefined' ? window.sessionStorage : undefined)
        : undefined,
    },
  })
}
