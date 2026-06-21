import { describe, it, expect } from 'vitest'
import { toBEYear, fromBEYear, toThaiDate, formatRetirementCountdown } from '@/lib/utils/thai-date'

describe('toBEYear / fromBEYear', () => {
  it('converts AD year to BE (Buddhist Era) by +543', () => {
    expect(toBEYear(2024)).toBe(2567)
  })
  it('converts BE year back to AD by -543', () => {
    expect(fromBEYear(2567)).toBe(2024)
  })
})

describe('toThaiDate', () => {
  it('formats a Date as "<day> <month-th> <BE-year>"', () => {
    // construct as local date to avoid timezone drift on getDate()
    expect(toThaiDate(new Date(2024, 0, 15))).toBe('15 ม.ค. 2567')
  })
  it('supports full month names', () => {
    expect(toThaiDate(new Date(2024, 0, 15), true)).toBe('15 มกราคม 2567')
  })
})

describe('formatRetirementCountdown', () => {
  it('returns "เกษียณแล้ว" for a past date', () => {
    expect(formatRetirementCountdown('2000-01-01')).toBe('เกษียณแล้ว')
  })
})
