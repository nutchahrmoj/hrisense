'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth'

export default function ResetPasswordPage() {
  const router = useRouter()
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

  const [form, setForm] = useState<ResetPasswordInput>({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof ResetPasswordInput, string>>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function validate(): boolean {
    const result = resetPasswordSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ResetPasswordInput, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ResetPasswordInput
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError(null)

    if (!validate()) return

    setLoading(true)

    if (isMock) {
      setTimeout(() => {
        setSuccess(true)
        setLoading(false)
      }, 1000)
      return
    }

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password: form.password,
      })

      if (updateError) {
        if (updateError.message.includes('New password should be different')) {
          setApiError('รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม')
        } else {
          setApiError('ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่')
        }
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setApiError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(field: keyof ResetPasswordInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (apiError) setApiError(null)
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">เปลี่ยนรหัสผ่านสำเร็จ</h1>
        <p className="text-sm text-muted-foreground">
          รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
        >
          เข้าสู่ระบบ
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">ตั้งรหัสผ่านใหม่</h1>
        <p className="text-sm text-muted-foreground">
          กรอกรหัสผ่านใหม่ที่ต้องการ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {apiError && (
          <div
            className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {apiError}
          </div>
        )}

        {/* New Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            รหัสผ่านใหม่
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full px-3 py-2 pr-10 rounded-lg border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.password ? 'border-destructive' : ''
              }`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : 'password-hint'}
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
          {errors.password ? (
            <p id="password-error" className="text-sm text-destructive" role="alert">
              {errors.password}
            </p>
          ) : (
            <p id="password-hint" className="text-xs text-muted-foreground">
              อย่างน้อย 8 ตัวอักษร, A-Z, a-z, 0-9
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            ยืนยันรหัสผ่าน
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`w-full px-3 py-2 pr-10 rounded-lg border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.confirmPassword ? 'border-destructive' : ''
              }`}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showConfirm ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p id="confirm-error" className="text-sm text-destructive" role="alert">
              {errors.confirmPassword}
            </p>
          )}
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
              กำลังเปลี่ยนรหัสผ่าน...
            </>
          ) : (
            'เปลี่ยนรหัสผ่าน'
          )}
        </button>
      </form>
    </div>
  )
}
