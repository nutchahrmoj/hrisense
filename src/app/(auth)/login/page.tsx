'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, Shield } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'

const REMEMBER_LOGIN_KEY = 'hrisense:remember-login'
const REMEMBERED_EMAIL_KEY = 'hrisense:remembered-email'

export default function LoginPage() {
  const router = useRouter()
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true' && process.env.NODE_ENV !== 'production'

  const [form, setForm] = useState<LoginInput>({ email: '', password: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    const storedRemember = window.localStorage.getItem(REMEMBER_LOGIN_KEY) === 'true'
    const storedEmail = window.localStorage.getItem(REMEMBERED_EMAIL_KEY)

    setRememberMe(storedRemember)
    if (storedRemember && storedEmail) {
      setForm((prev) => ({ ...prev, email: storedEmail }))
    }
  }, [])

  function validate(): boolean {
    const result = loginSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginInput, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginInput
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      })
      setErrors(fieldErrors)
      return false
    }
    setErrors({})
    return true
  }

  function persistRememberPreference() {
    if (rememberMe) {
      window.localStorage.setItem(REMEMBER_LOGIN_KEY, 'true')
      window.localStorage.setItem(REMEMBERED_EMAIL_KEY, form.email)
      return
    }

    window.localStorage.removeItem(REMEMBER_LOGIN_KEY)
    window.localStorage.removeItem(REMEMBERED_EMAIL_KEY)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setApiError(null)

    if (!validate()) return

    persistRememberPreference()
    setLoading(true)

    if (isMock) {
      router.push('/dashboard')
      return
    }

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient({ rememberSession: rememberMe })
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (error) {
        // Record failed attempt for rate limiting
        try {
          const res = await fetch('/api/auth/login-attempt', { method: 'POST' })
          const data = await res.json()
          if (data.remaining === 0) {
            setApiError(data.message)
            setLoading(false)
            return
          }
        } catch {
          // Rate limit recording failed — continue with normal error
        }

        if (error.message.includes('Invalid login credentials')) {
          setApiError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
        } else if (error.message.includes('Email not confirmed')) {
          setApiError('กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ')
        } else {
          setApiError('เกิดข้อผิดพลาด กรุณาลองใหม่')
        }
        setLoading(false)
        return
      }

      // Role-based redirect
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'admin') {
          router.push('/dashboard')
        } else {
          router.push('/personnel')
        }
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      // Surface the real error instead of swallowing it. A missing
      // NEXT_PUBLIC_ Supabase var throws here (createClient) and previously
      // logged nothing — making it look like a generic "server unreachable".
      console.error('[login] sign-in failed:', err)
      const isConfigError =
        err instanceof Error && /not configured/i.test(err.message)
      setApiError(
        isConfigError
          ? 'ระบบยังไม่ได้ตั้งค่าการเชื่อมต่อเซิร์ฟเวอร์ กรุณาแจ้งผู้ดูแลระบบ'
          : 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง'
      )
      setLoading(false)
    }
  }

  function handleChange(field: keyof LoginInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (apiError) setApiError(null)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">HRiSENSE</h1>
        <p className="text-sm text-muted-foreground">ระบบพยากรณ์และบริหารความเสี่ยงด้านกำลังคน</p>
        <p className="text-xs text-muted-foreground">สำนักงานปลัดกระทรวงยุติธรรม</p>
        {isMock && <p className="text-xs text-amber-600 font-medium">🧪 โหมดทดสอบ (Mock Data)</p>}
      </div>

      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        {/* API Error */}
        {apiError && (
          <div
            className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {apiError}
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            อีเมล
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full rounded-lg border bg-card py-2 pl-10 pr-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.email ? 'border-destructive' : ''
              }`}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            รหัสผ่าน
          </label>
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full rounded-lg border bg-card py-2 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.password ? 'border-destructive' : ''
              }`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive" role="alert">
              {errors.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <label htmlFor="remember-me" className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
            />
            <span>จดจำฉัน</span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังเข้าสู่ระบบ...
            </>
          ) : isMock ? (
            'เข้าสู่ระบบ (Mock)'
          ) : (
            'เข้าสู่ระบบ'
          )}
        </button>
      </form>

      {/* Forgot password link */}
      <div className="text-center">
        <a
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          ลืมรหัสผ่าน?
        </a>
      </div>

      {/* Footer */}
      <footer className="text-center text-[10px] sm:text-xs text-muted-foreground/80 pt-6 border-t border-border/40 space-y-1">
        <p>Copy Right 2026 Nutcha Anuntavichien</p>
        <p>กองบริหารทรัพยากรบุคคล สำนักงานปลัดกระทรวงยุติธรรม</p>
      </footer>
    </div>
  )
}
