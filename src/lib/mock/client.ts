import {
  mockPersonnel, mockOrgDashboard, mockRetirementTimeline,
  mockVacancyAnalysis, mockHighRiskPersonnel, mockActiveAlerts,
  mockWorkforceComposition, mockOrganizations,
  mockRiskDistribution, mockOrgRiskDetails, mockCriticalPositions,
  mockSuccessionCandidates, mockOrgVacancySummary, mockCriticalVacancies,
  mockRecruitmentPipeline, mockIdpSummary, mockTrainingRecords,
  mockHighPotentialPersonnel,
} from './data'

class MockQueryBuilder {
  private table: string
  private filters: Record<string, any> = {}
  private orderByField: string | null = null
  private orderByAsc = true
  private limitCount: number | null = null
  private singleMode = false

  constructor(table: string) { this.table = table }

  private clone(): MockQueryBuilder {
    const next = new MockQueryBuilder(this.table)
    next.filters = { ...this.filters }
    next.orderByField = this.orderByField
    next.orderByAsc = this.orderByAsc
    next.limitCount = this.limitCount
    next.singleMode = this.singleMode
    return next
  }

  select(fields: string = '*') { return this }
  eq(field: string, value: any) {
    const next = this.clone()
    next.filters[field] = value
    return next
  }
  order(field: string, opts?: { ascending?: boolean }) {
    const next = this.clone()
    next.orderByField = field
    next.orderByAsc = opts?.ascending ?? true
    return next
  }
  limit(count: number) {
    const next = this.clone()
    next.limitCount = count
    return next
  }
  single() {
    const next = this.clone()
    next.singleMode = true
    return next
  }

  async then(resolve: (value: any) => void) {
    let result = this.getData()
    for (const [field, value] of Object.entries(this.filters)) {
      result = result.filter((item: any) => item[field] === value)
    }
    if (this.orderByField) {
      const field = this.orderByField
      const asc = this.orderByAsc
      result = [...result].sort((a: any, b: any) => {
        const va = a[field]
        const vb = b[field]
        if (va == null && vb == null) return 0
        if (va == null) return asc ? -1 : 1
        if (vb == null) return asc ? 1 : -1
        if (typeof va === 'number' && typeof vb === 'number') return asc ? va - vb : vb - va
        const cmp = String(va) < String(vb) ? -1 : String(va) > String(vb) ? 1 : 0
        return asc ? cmp : -cmp
      })
    }
    if (this.limitCount) result = result.slice(0, this.limitCount)
    resolve({ data: this.singleMode ? (result[0] || null) : result, error: null })
  }

  private getData(): any[] {
    const map: Record<string, any[]> = {
      'v_personnel_overview': mockPersonnel,
      'v_org_dashboard': mockOrgDashboard,
      'v_retirement_timeline': mockRetirementTimeline,
      'v_vacancy_analysis': mockVacancyAnalysis,
      'v_high_risk_personnel': mockHighRiskPersonnel,
      'v_active_alerts': mockActiveAlerts,
      'v_workforce_composition': mockWorkforceComposition,
      'v_risk_distribution': mockRiskDistribution,
      'v_org_risk_details': mockOrgRiskDetails,
      'v_critical_positions': mockCriticalPositions,
      'v_succession_candidates': mockSuccessionCandidates,
      'v_org_vacancy_summary': mockOrgVacancySummary,
      'v_critical_vacancies': mockCriticalVacancies,
      'v_recruitment_pipeline': mockRecruitmentPipeline,
      'v_idp_summary': mockIdpSummary,
      'v_training_records': mockTrainingRecords,
      'v_high_potential_personnel': mockHighPotentialPersonnel,
      'organizations': mockOrganizations,
      'personnel': mockPersonnel,
      'alerts': mockActiveAlerts,
      'profiles': [{ id: 'user-1', role: 'admin', department_id: 'org-5', first_name_th: 'Admin', last_name_th: 'User', language: 'th', created_at: '2024-01-01' }],
    }
    return map[this.table] || []
  }
}

class MockSupabaseClient {
  auth = {
    async getUser() { return { data: { user: { id: 'user-1', email: 'admin@moj.go.th' } }, error: null } },
    async signInWithPassword({ email }: { email: string; password: string }) { return { data: { user: { id: 'user-1', email } }, error: null } },
    async signOut() { return { error: null } },
    async exchangeCodeForSession() { return { error: null } },
    async updateUser() { return { data: { user: { id: 'user-1', email: 'admin@moj.go.th' } }, error: null } },
  }
  channel() { return { on: () => ({ subscribe: () => ({}) }), subscribe: () => ({}) } }
  removeChannel() {}
  from(table: string) { return new MockQueryBuilder(table) }
}

let mockClient: MockSupabaseClient | null = null
export function createMockClient() { if (!mockClient) mockClient = new MockSupabaseClient(); return mockClient }
export function createMockServerClient() { return new MockSupabaseClient() }
