import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  toThaiDate,
  toBEYear,
  fromBEYear,
  formatYearBE,
  formatRetirementCountdown,
} from '@/lib/utils/thai-date'

describe('Thai Date Utility', () => {
  beforeEach(() => {
    // Freeze time to Tuesday, June 30, 2026
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-30T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('toThaiDate', () => {
    it('แปลง Date object เป็นวันที่ภาษาไทย (ย่อ)', () => {
      const date = new Date('2026-06-15T00:00:00Z')
      expect(toThaiDate(date)).toBe('15 มิ.ย. 2569')
    })

    it('แปลง Date object เป็นวันที่ภาษาไทย (เต็ม)', () => {
      const date = new Date('2026-06-15T00:00:00Z')
      expect(toThaiDate(date, true)).toBe('15 มิถุนายน 2569')
    })

    it('แปลง string date เป็นวันที่ภาษาไทย', () => {
      expect(toThaiDate('2026-12-05T00:00:00Z')).toBe('5 ธ.ค. 2569')
    })
  })

  describe('toBEYear', () => {
    it('แปลงปี ค.ศ. เป็น พ.ศ.', () => {
      expect(toBEYear(2026)).toBe(2569)
      expect(toBEYear(2000)).toBe(2543)
    })
  })

  describe('fromBEYear', () => {
    it('แปลงปี พ.ศ. เป็น ค.ศ.', () => {
      expect(fromBEYear(2569)).toBe(2026)
      expect(fromBEYear(2543)).toBe(2000)
    })
  })

  describe('formatYearBE', () => {
    it('จัดรูปแบบปี พ.ศ. พร้อมคำนำหน้า', () => {
      expect(formatYearBE(2026)).toBe('พ.ศ. 2569')
    })
  })

  describe('formatRetirementCountdown', () => {
    it('แสดง "เกษียณแล้ว" เมื่อวันเกษียณผ่านมาแล้ว', () => {
      expect(formatRetirementCountdown('2026-06-29T00:00:00Z')).toBe('เกษียณแล้ว')
    })

    it('แสดงจำนวนปีและเดือนที่เหลือเมื่อเหลือมากกว่า 1 ปี', () => {
      // 2026-06-30 to 2028-08-30 is 792 days, which is ~2.16 years (2 years, 2 months)
      expect(formatRetirementCountdown('2028-08-30T12:00:00Z')).toContain('ปี')
      expect(formatRetirementCountdown('2028-08-30T12:00:00Z')).toContain('เดือน')
    })

    it('แสดงจำนวนเดือนและวันที่เหลือเมื่อเหลือน้อยกว่า 1 ปี', () => {
      // 2026-06-30 to 2026-08-15 is 46 days (1 month, 16 days)
      expect(formatRetirementCountdown('2026-08-15T12:00:00Z')).toContain('เดือน')
      expect(formatRetirementCountdown('2026-08-15T12:00:00Z')).toContain('วัน')
    })
  })
})
