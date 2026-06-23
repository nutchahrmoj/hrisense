import { describe, it, expect } from 'vitest'
import {
  getRiskLevel,
  riskColorMap,
  riskDotMap,
  riskLabelTh,
  riskChartColors,
  type RiskLevel,
} from '@/lib/utils/risk-colors'

describe('Risk Colors Utility', () => {
  describe('getRiskLevel', () => {
    describe('critical (คะแนน > 80)', () => {
      it('返回 critical สำหรับคะแนน 81', () => {
        expect(getRiskLevel(81)).toBe('critical')
      })

      it('返回 critical สำหรับคะแนน 90', () => {
        expect(getRiskLevel(90)).toBe('critical')
      })

      it('返回 critical สำหรับคะแนน 100', () => {
        expect(getRiskLevel(100)).toBe('critical')
      })

      it('返回 critical สำหรับคะแนน > 100', () => {
        expect(getRiskLevel(150)).toBe('critical')
      })
    })

    describe('red (คะแนน 71-80)', () => {
      it('返回 red สำหรับคะแนน 71', () => {
        expect(getRiskLevel(71)).toBe('red')
      })

      it('返回 red สำหรับคะแนน 75', () => {
        expect(getRiskLevel(75)).toBe('red')
      })

      it('返回 red สำหรับคะแนน 80', () => {
        expect(getRiskLevel(80)).toBe('red')
      })
    })

    describe('amber (คะแนน 51-70)', () => {
      it('返回 amber สำหรับคะแนน 51', () => {
        expect(getRiskLevel(51)).toBe('amber')
      })

      it('返回 amber สำหรับคะแนน 60', () => {
        expect(getRiskLevel(60)).toBe('amber')
      })

      it('返回 amber สำหรับคะแนน 70', () => {
        expect(getRiskLevel(70)).toBe('amber')
      })
    })

    describe('green (คะแนน ≤ 50)', () => {
      it('返回 green สำหรับคะแนน 0', () => {
        expect(getRiskLevel(0)).toBe('green')
      })

      it('返回 green สำหรับคะแนน 25', () => {
        expect(getRiskLevel(25)).toBe('green')
      })

      it('返回 green สำหรับคะแนน 50', () => {
        expect(getRiskLevel(50)).toBe('green')
      })
    })

    describe('boundary values', () => {
      it('คะแนน 50 = green', () => {
        expect(getRiskLevel(50)).toBe('green')
      })

      it('คะแนน 51 = amber', () => {
        expect(getRiskLevel(51)).toBe('amber')
      })

      it('คะแนน 70 = amber', () => {
        expect(getRiskLevel(70)).toBe('amber')
      })

      it('คะแนน 71 = red', () => {
        expect(getRiskLevel(71)).toBe('red')
      })

      it('คะแนน 80 = red', () => {
        expect(getRiskLevel(80)).toBe('red')
      })

      it('คะแนน 81 = critical', () => {
        expect(getRiskLevel(81)).toBe('critical')
      })
    })
  })

  describe('riskColorMap', () => {
    it('มีครบทุก risk level', () => {
      const levels: RiskLevel[] = ['green', 'amber', 'red', 'critical']
      levels.forEach((level) => {
        expect(riskColorMap).toHaveProperty(level)
        expect(riskColorMap[level]).toBeTruthy()
      })
    })

    it('green มีสีเขียว', () => {
      expect(riskColorMap.green).toContain('green')
    })

    it('amber มีสีเหลือง/amber', () => {
      expect(riskColorMap.amber).toContain('amber')
    })

    it('red มีสีแดง', () => {
      expect(riskColorMap.red).toContain('red')
    })

    it('critical มีสีแดงเข้ม', () => {
      expect(riskColorMap.critical).toContain('red')
    })
  })

  describe('riskDotMap', () => {
    it('มีครบทุก risk level', () => {
      const levels: RiskLevel[] = ['green', 'amber', 'red', 'critical']
      levels.forEach((level) => {
        expect(riskDotMap).toHaveProperty(level)
      })
    })
  })

  describe('riskLabelTh', () => {
    it('green = ปกติ', () => {
      expect(riskLabelTh.green).toBe('ปกติ')
    })

    it('amber = เฝ้าระวัง', () => {
      expect(riskLabelTh.amber).toBe('เฝ้าระวัง')
    })

    it('red = เสี่ยงสูง', () => {
      expect(riskLabelTh.red).toBe('เสี่ยงสูง')
    })

    it('critical = วิกฤต', () => {
      expect(riskLabelTh.critical).toBe('วิกฤต')
    })
  })

  describe('riskChartColors', () => {
    it('มีครบทุก risk level', () => {
      expect(riskChartColors).toHaveProperty('green')
      expect(riskChartColors).toHaveProperty('amber')
      expect(riskChartColors).toHaveProperty('red')
      expect(riskChartColors).toHaveProperty('critical')
    })

    it('สีเป็น hex format', () => {
      Object.values(riskChartColors).forEach((color) => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })
  })
})
