import { describe, it, expect } from 'vitest'
import { loginSchema, resetPasswordSchema } from '@/lib/validations/auth'

describe('loginSchema', () => {
  it('rejects empty email with the "required" message (not the format message)', () => {
    const r = loginSchema.safeParse({ email: '', password: 'x' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].message).toBe('กรุณากรอกอีเมล')
  })
  it('rejects malformed email with the format message', () => {
    const r = loginSchema.safeParse({ email: 'not-an-email', password: 'x' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].message).toBe('รูปแบบอีเมลไม่ถูกต้อง')
  })
  it('accepts a valid login', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'secret' }).success).toBe(true)
  })
})

describe('resetPasswordSchema', () => {
  const valid = { password: 'Abcd1234', confirmPassword: 'Abcd1234' }

  it('accepts a strong matching password', () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true)
  })
  it('rejects a password missing an uppercase letter', () => {
    expect(resetPasswordSchema.safeParse({ password: 'abcd1234', confirmPassword: 'abcd1234' }).success).toBe(false)
  })
  it('rejects a password missing a digit', () => {
    expect(resetPasswordSchema.safeParse({ password: 'Abcdefgh', confirmPassword: 'Abcdefgh' }).success).toBe(false)
  })
  it('reports mismatch on the confirmPassword path', () => {
    const r = resetPasswordSchema.safeParse({ password: 'Abcd1234', confirmPassword: 'Abcd9999' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues.some(i => i.path.includes('confirmPassword'))).toBe(true)
  })
})
