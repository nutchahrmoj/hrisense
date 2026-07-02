import { describe, expect, it } from 'vitest'

import { mergePersonnelBurnout } from '@/lib/utils/personnel-burnout'

describe('mergePersonnelBurnout', () => {
  it('adds burnout score and factors from v_burnout_analysis rows', () => {
    const personnel = [
      { id: 'p-1', full_name_th: 'A', burnout_risk: undefined },
      { id: 'p-2', full_name_th: 'B', burnout_risk: undefined },
    ]

    const merged = mergePersonnelBurnout(personnel, [
      {
        personnel_id: 'p-1',
        burnout_risk: 72.5,
        late_days_ytd: 5,
        absent_days_ytd: 2,
        performance_score: 80,
        overtime_hours_ytd: 120,
        training_hours_ytd: 16,
        workload_index: 70,
      },
    ])

    expect(merged[0]).toMatchObject({
      id: 'p-1',
      burnout_risk: 72.5,
      burnout_factors: {
        late_days_ytd: 5,
        absent_days_ytd: 2,
        performance_score: 80,
        overtime_hours_ytd: 120,
        training_hours_ytd: 16,
        workload_index: 70,
      },
    })
    expect(merged[1]).toEqual(personnel[1])
  })
})
