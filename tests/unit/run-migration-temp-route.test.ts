import { describe, expect, it } from 'vitest'
import { GET } from '@/app/api/run-migration-temp/route'

describe('temporary migration API route', () => {
  it('is disabled and cannot run production migrations', async () => {
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(410)
    expect(body).toEqual({
      error: 'Temporary production migration endpoint has been disabled.',
    })
    expect(body).not.toHaveProperty('success')
  })
})
