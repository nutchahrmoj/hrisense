export type BurnoutAnalysisRow = {
  personnel_id: string
  burnout_risk: number | null
  late_days_ytd?: number | null
  absent_days_ytd?: number | null
  performance_score?: number | null
  overtime_hours_ytd?: number | null
  training_hours_ytd?: number | null
  workload_index?: number | null
}

export function mergePersonnelBurnout<T extends { id: string }>(
  personnel: T[],
  burnoutRows: BurnoutAnalysisRow[] | null | undefined,
): T[] {
  if (!burnoutRows?.length) return personnel

  const burnoutByPersonnelId = new Map(
    burnoutRows.map((row) => [row.personnel_id, row]),
  )

  return personnel.map((person) => {
    const burnout = burnoutByPersonnelId.get(person.id)
    if (!burnout) return person

    return {
      ...person,
      burnout_risk: burnout.burnout_risk,
      burnout_factors: {
        late_days_ytd: burnout.late_days_ytd,
        absent_days_ytd: burnout.absent_days_ytd,
        performance_score: burnout.performance_score,
        overtime_hours_ytd: burnout.overtime_hours_ytd,
        training_hours_ytd: burnout.training_hours_ytd,
        workload_index: burnout.workload_index,
      },
    }
  })
}
