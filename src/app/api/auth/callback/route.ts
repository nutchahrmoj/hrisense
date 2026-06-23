import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sanitizeRedirectPath } from '@/lib/security/redirect-guard'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Open-redirect guard: only allow same-origin relative paths
  const safeNext = sanitizeRedirectPath(next)

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
}
