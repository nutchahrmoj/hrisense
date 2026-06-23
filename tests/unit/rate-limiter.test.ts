import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the module to get a fresh state for each test
// Since rate-limiter uses module-level state, we need to reset it between tests
vi.mock('@/lib/security/rate-limiter', async () => {
  const actual = await vi.importActual<typeof import('@/lib/security/rate-limiter')>('@/lib/security/rate-limiter')
  return actual
})

import {
  isRateLimited,
  recordLoginAttempt,
  getRemainingAttempts,
  getRetryAfterSeconds,
} from '@/lib/security/rate-limiter'

describe('Rate Limiter', () => {
  const testIp = '192.168.1.1'

  // Helper to simulate multiple login attempts
  function simulateAttempts(ip: string, count: number) {
    for (let i = 0; i < count; i++) {
      recordLoginAttempt(ip)
    }
  }

  describe('isRateLimited', () => {
    it('ไม่ rate limit สำหรับ IP ที่ยังไม่เคยพยายาม', () => {
      expect(isRateLimited('10.0.0.1')).toBe(false)
    })

    it('ไม่ rate limit เมื่อยังไม่ถึง max attempts', () => {
      simulateAttempts(testIp, 5)
      expect(isRateLimited(testIp)).toBe(false)
    })

    it('rate limit เมื่อถึง max attempts (10)', () => {
      simulateAttempts(testIp, 10)
      expect(isRateLimited(testIp)).toBe(true)
    })

    it('rate limit เมื่อเกิน max attempts', () => {
      simulateAttempts(testIp, 15)
      expect(isRateLimited(testIp)).toBe(true)
    })

    it('ไม่ rate limit IP อื่นที่ยังไม่ถึง max', () => {
      simulateAttempts('10.0.0.1', 10)
      expect(isRateLimited('10.0.0.2')).toBe(false)
    })
  })

  describe('recordLoginAttempt', () => {
    it('เริ่มต้นด้วย count = 1 สำหรับ IP ใหม่', () => {
      const ip = '172.16.0.1'
      recordLoginAttempt(ip)
      expect(getRemainingAttempts(ip)).toBe(9)
    })

    it('เพิ่ม count เมื่อบันทึกซ้ำ', () => {
      const ip = '172.16.0.2'
      recordLoginAttempt(ip)
      recordLoginAttempt(ip)
      recordLoginAttempt(ip)
      expect(getRemainingAttempts(ip)).toBe(7)
    })
  })

  describe('getRemainingAttempts', () => {
    it('返回 max attempts สำหรับ IP ที่ยังไม่เคยพยายาม', () => {
      expect(getRemainingAttempts('10.0.0.99')).toBe(10)
    })

    it('返回 0 เมื่อถึง max attempts', () => {
      const ip = '10.0.0.50'
      simulateAttempts(ip, 10)
      expect(getRemainingAttempts(ip)).toBe(0)
    })

    it('返回ค่าที่ถูกต้องหลังจากพยายาม 5 ครั้ง', () => {
      const ip = '10.0.0.51'
      simulateAttempts(ip, 5)
      expect(getRemainingAttempts(ip)).toBe(5)
    })
  })

  describe('getRetryAfterSeconds', () => {
    it('返回 0 สำหรับ IP ที่ยังไม่เคยพยายาม', () => {
      expect(getRetryAfterSeconds('10.0.0.99')).toBe(0)
    })

    it('返回ค่า > 0 เมื่อถูก rate limit', () => {
      const ip = '10.0.0.60'
      simulateAttempts(ip, 10)
      const retryAfter = getRetryAfterSeconds(ip)
      // Should be close to 15 minutes (900 seconds)
      expect(retryAfter).toBeGreaterThan(0)
      expect(retryAfter).toBeLessThanOrEqual(900)
    })
  })

  describe('Edge cases', () => {
    it('จัดการ IP ที่เป็น empty string', () => {
      expect(isRateLimited('')).toBe(false)
      recordLoginAttempt('')
      expect(getRemainingAttempts('')).toBe(9)
    })

    it('จัดการ IP ที่มี special characters', () => {
      const ip = '::1' // IPv6 localhost
      expect(isRateLimited(ip)).toBe(false)
      simulateAttempts(ip, 10)
      expect(isRateLimited(ip)).toBe(true)
    })

    it('จัดการ attempts จำนวนมาก', () => {
      const ip = '10.0.0.70'
      simulateAttempts(ip, 100)
      expect(isRateLimited(ip)).toBe(true)
      expect(getRemainingAttempts(ip)).toBe(0)
    })
  })
})
