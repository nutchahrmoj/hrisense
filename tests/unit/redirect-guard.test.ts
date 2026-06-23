import { describe, it, expect } from 'vitest'
import { sanitizeRedirectPath } from '@/lib/security/redirect-guard'

describe('Redirect Guard (Open-Redirect Prevention)', () => {
  const DEFAULT = '/dashboard'

  describe('safe paths — ควรใช้ path ที่ส่งมา', () => {
    it('path ปกติ /personnel', () => {
      expect(sanitizeRedirectPath('/personnel')).toBe('/personnel')
    })

    it('path ซ้อน /dashboard/risk', () => {
      expect(sanitizeRedirectPath('/dashboard/risk')).toBe('/dashboard/risk')
    })

    it('path ที่มี query string', () => {
      expect(sanitizeRedirectPath('/login?redirectedFrom=/dashboard')).toBe('/login?redirectedFrom=/dashboard')
    })

    it('path ที่มี hash', () => {
      expect(sanitizeRedirectPath('/settings#profile')).toBe('/settings#profile')
    })

    it('root path /', () => {
      expect(sanitizeRedirectPath('/')).toBe('/')
    })
  })

  describe('malicious paths — ควร fallback เป็น default', () => {
    it('protocol-relative URL //evil.com', () => {
      expect(sanitizeRedirectPath('//evil.com')).toBe(DEFAULT)
    })

    it('absolute URL https://evil.com', () => {
      expect(sanitizeRedirectPath('https://evil.com')).toBe(DEFAULT)
    })

    it('absolute URL http://evil.com', () => {
      expect(sanitizeRedirectPath('http://evil.com')).toBe(DEFAULT)
    })

    it('URL with protocol in path /https://evil.com', () => {
      // This contains :// which is suspicious
      expect(sanitizeRedirectPath('/https://evil.com')).toBe(DEFAULT)
    })

    it('backslash path traversal \\..\\..\\etc', () => {
      expect(sanitizeRedirectPath('\\..\\..\\etc')).toBe(DEFAULT)
    })

    it('mixed slash path /..\\..\\etc', () => {
      expect(sanitizeRedirectPath('/..\\..\\etc')).toBe(DEFAULT)
    })

    it('null byte injection /path%00evil', () => {
      expect(sanitizeRedirectPath('/path\0evil')).toBe(DEFAULT)
    })

    it('javascript protocol javascript:alert(1)', () => {
      expect(sanitizeRedirectPath('javascript:alert(1)')).toBe(DEFAULT)
    })
  })

  describe('edge cases — ค่าที่ไม่ใช่ string', () => {
    it('null → fallback', () => {
      expect(sanitizeRedirectPath(null)).toBe(DEFAULT)
    })

    it('undefined → fallback', () => {
      expect(sanitizeRedirectPath(undefined)).toBe(DEFAULT)
    })

    it('empty string → fallback', () => {
      expect(sanitizeRedirectPath('')).toBe(DEFAULT)
    })
  })

  describe('custom fallback', () => {
    it('ใช้ custom fallback เมื่อ path ไม่ปลอดภัย', () => {
      expect(sanitizeRedirectPath('//evil.com', '/login')).toBe('/login')
    })

    it('ใช้ custom fallback เมื่อเป็น null', () => {
      expect(sanitizeRedirectPath(null, '/home')).toBe('/home')
    })

    it('ไม่ใช้ fallback เมื่อ path ปลอดภัย', () => {
      expect(sanitizeRedirectPath('/safe', '/login')).toBe('/safe')
    })
  })
})
