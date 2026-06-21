import { describe, it, expect } from 'vitest'
import { getRiskLevel } from '@/lib/utils/risk-colors'

// Locks in the current threshold contract: >80 critical, >70 red, >50 amber, else green.
describe('getRiskLevel boundaries', () => {
  it('81 -> critical', () => expect(getRiskLevel(81)).toBe('critical'))
  it('80 -> red (not critical)', () => expect(getRiskLevel(80)).toBe('red'))
  it('71 -> red', () => expect(getRiskLevel(71)).toBe('red'))
  it('70 -> amber (not red)', () => expect(getRiskLevel(70)).toBe('amber'))
  it('51 -> amber', () => expect(getRiskLevel(51)).toBe('amber'))
  it('50 -> green (not amber)', () => expect(getRiskLevel(50)).toBe('green'))
  it('0 -> green', () => expect(getRiskLevel(0)).toBe('green'))
})
