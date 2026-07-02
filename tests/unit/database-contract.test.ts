import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('database view contracts', () => {
  it('v_personnel_overview exposes burnout fields for personnel risk display', () => {
    const databaseTypes = readFileSync(
      join(process.cwd(), 'src/lib/types/database.ts'),
      'utf8',
    )

    const personnelOverviewDefinition =
      databaseTypes.match(/v_personnel_overview:\s*\{\s*Row:\s*\{[\s\S]+?\}/)?.[0] ?? ''

    expect(personnelOverviewDefinition).toContain('burnout_risk')
    expect(personnelOverviewDefinition).toContain('burnout_factors')
  })
})
