'use client'
import { useState } from 'react'
import { Shield, ArrowLeft, Loader2, Mail } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'

export default function ForgotPasswordPage() {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  function validate(): boolean {
    const result = forgotPasswordSchema.safeParse({ email })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return false
    }
    setError(null)
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    if (isMock) {
      setTimeout(() => {
        setSent(true)
        setLoading(false)
      }, 1000)
      return
    }

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        setError('ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่')
        setLoading(false)
        return
      }

      setSent(true)
    } catch {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-4">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">ส่งอีเมลแล้ว</h1>
        <p className="text-sm text-muted-foreground">
          เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปที่ <strong>{email}</strong>
        </p>
        <p className="text-xs text-muted-foreground">
          กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึง spam/junk)
        </p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าเข้าสู่ระบบ
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">ลืมรหัสผ่าน</h1>
        <p className="text-sm text-muted-foreground">
          กรอกอีเมลที่ใช้ลงทะเบียน เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div
            className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            อีเมล
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
            className={`w-full px-3 py-2 rounded-lg border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              error ? 'border-destructive' : ''
            }`}
            aria-invalid={!!error}
            aria-describedby={error ? 'email-error' : undefined}
          />
          {error && (
            <p id="email-error" className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังส่ง...
            </>
          ) : (
            'ส่งลิงก์รีเซ็ตรหัสผ่าน'
          )}
        </button>
      </form>

      <div className="text-center">
        <a
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าเข้าสู่ระบบ
        </a>
      </div>
    </div>
  )
}
