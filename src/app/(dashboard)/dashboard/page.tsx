import { createServerSupabaseClient } from '@/lib/supabase/server'
import { KPICard } from '@/components/dashboard/kpi-card'
import { RiskBadge } from '@/components/personnel/risk-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FilterBar } from '@/components/filters/filter-bar'
import { RetirementTrendChart } from '@/components/charts/retirement-trend-chart'
import { getRiskLevel, getRiskTextColor } from '@/lib/utils/risk-colors'
import Link from 'next/link'
import {
  Users, TrendingDown, CalendarClock, AlertTriangle,
  Briefcase, UserCheck, Activity, Target,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const RISK_LABEL_TH: Record<string, string> = {
  critical: 'วิกฤต',
  red: 'เสี่ยงสูง',
  amber: 'เฝ้าระวัง',
  green: 'ปกติ',
}

// Use getRiskLevel() as single source of truth for risk thresholds.
function matchesRiskFilter(score: number, levels: string[]): boolean {
  if (levels.length === 0) return true
  return levels.includes(getRiskLevel(score))
}

function asString(value: string | string[] | undefined): string {
  if (typeof value === 'string') return value
  return ''
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createServerSupabaseClient()

  const orgFilter = asString(searchParams.org)
  const riskParam = asString(searchParams.risk)
  const riskLevels = riskParam ? riskParam.split(',').filter(Boolean) : []

  // v_org_dashboard is fetched unfiltered so the หน่วยงาน dropdown always
  // lists every org; the org filter is applied in JS for KPI aggregation.
  // The data views are filtered server-side via .eq() — but only when a real
  // org is selected, so the unfiltered (no-param) case returns everything.
  const orgQuery = supabase.from('v_org_dashboard').select('*')

  let retirementQuery = supabase.from('v_retirement_timeline').select('*')
  if (orgFilter) retirementQuery = retirementQuery.eq('organization_id', orgFilter)
  retirementQuery = retirementQuery.limit(500)

  let highRiskQuery = supabase.from('v_high_risk_personnel').select('*')
  if (orgFilter) highRiskQuery = highRiskQuery.eq('organization_id', orgFilter)
  highRiskQuery = highRiskQuery.limit(20)

  let alertQuery = supabase.from('v_active_alerts').select('*')
  if (orgFilter) alertQuery = alertQuery.eq('organization_id', orgFilter)
  alertQuery = alertQuery.limit(15)

  // All personnel (scoped by org filter) — the source for the true org-wide
  // risk-level distribution. v_high_risk_personnel excludes low-risk staff by
  // definition, so it can never show an honest "ปกติ" count.
  let personnelQuery = supabase.from('v_personnel_overview').select('id,risk_level,overall_risk_score,organization_id')
  if (orgFilter) personnelQuery = personnelQuery.eq('organization_id', orgFilter)

  const [orgData, retirementData, highRiskData, alertData, personnelData] = await Promise.all([
    orgQuery,
    retirementQuery,
    highRiskQuery,
    alertQuery,
    personnelQuery,
  ])

  const queryErrors = [
    orgData.error,
    retirementData.error,
    highRiskData.error,
    alertData.error,
    personnelData.error,
  ].filter(Boolean)

  // Surface a real error state instead of silently rendering zeros.
  if (queryErrors.length > 0) {
    console.error('[dashboard] query errors:', queryErrors)
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">แดชบอร์ดหลัก</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-destructive" />
            <p className="font-medium text-foreground">ไม่สามารถโหลดข้อมูลแดชบอร์ดได้</p>
            <p className="text-sm text-muted-foreground mt-1">
              เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล โปรดลองรีเฟรชหน้านี้อีกครั้ง
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const orgsAll = orgData.data || []
  const retirementRows = retirementData.data || []
  const highRiskRowsRaw = highRiskData.data || []
  const alertRows = alertData.data || []
  const personnelRows = personnelData.data || []

  // KPI aggregation respects the org filter via JS over the full org list.
  const orgs = orgFilter
    ? orgsAll.filter((o: any) => o.organization_id === orgFilter)
    : orgsAll

  // Risk filter (multiselect) is applied in JS to the high-risk personnel set.
  const highRiskRows = highRiskRowsRaw.filter((p: any) =>
    matchesRiskFilter(p.overall_risk_score ?? 0, riskLevels),
  )

  const totalHeadcount = orgs.reduce((sum: number, o: any) => sum + (o.total_personnel || 0), 0)
  const totalQuota = orgs.reduce((sum: number, o: any) => sum + (o.total_quota || 0), 0)
  const totalVacant = orgs.reduce((sum: number, o: any) => sum + (o.vacancy_count || 0), 0)
  const vacancyRate = totalQuota > 0 ? ((totalVacant / totalQuota) * 100).toFixed(1) : '0'
  const fillRate = totalQuota > 0 ? ((1 - totalVacant / totalQuota) * 100).toFixed(1) : '0'
  const filledCount = totalQuota - totalVacant
  const retiring3yr = orgs.reduce((sum: number, o: any) => sum + (o.retirements_3yr || 0), 0)
  const highRiskCount = highRiskRows.length
  const alertCount = alertRows.length
  const criticalPositions = orgs.reduce((sum: number, o: any) => sum + (o.critical_positions || 0), 0)

  // True org-wide risk-level distribution, counted from all personnel so every
  // level (including ปกติ) can be non-zero. Counts use the view's risk_level
  // field to stay consistent with RiskBadge (Semantic Non-Negotiable).
  const personnelTotal = personnelRows.length
  const riskDistribution = {
    critical: personnelRows.filter((p: any) => p.risk_level === 'critical').length,
    red: personnelRows.filter((p: any) => p.risk_level === 'red').length,
    amber: personnelRows.filter((p: any) => p.risk_level === 'amber').length,
    green: personnelRows.filter((p: any) => p.risk_level === 'green').length,
  }

  // Real "last updated" = the latest computed_at across the org snapshot set.
  const lastUpdatedIso = orgsAll
    .map((o: any) => o.computed_at as string)
    .filter(Boolean)
    .sort()
    .pop()
  const lastUpdated = lastUpdatedIso
    ? new Date(lastUpdatedIso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
    : '—'

  const filteredOrgName = orgFilter
    ? orgsAll.find((o: any) => o.organization_id === orgFilter)?.name_th
    : undefined
  const activeRiskLabels = riskLevels.map((l) => RISK_LABEL_TH[l]).filter(Boolean)
  const hasActiveFilters = Boolean(filteredOrgName) || activeRiskLabels.length > 0

  // Retirement chart: the current Buddhist-Era year and the next two, counted
  // from the filtered timeline. Dynamic so it never goes stale.
  const currentBE = new Date().getFullYear() + 543
  const chartYears = [currentBE, currentBE + 1, currentBE + 2]
  const chartData = chartYears.map((year) => ({
    year: String(year),
    count: retirementRows.filter((r: any) => {
      const y = new Date(r.retirement_date).getFullYear() + 543
      return y === year
    }).length,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">แดชบอร์ดหลัก</h1>
          <p className="text-muted-foreground text-sm mt-1">
            ภาพรวมสถานการณ์กำลังคนและความเสี่ยงของสำนักงานปลัดกระทรวงยุติธรรม
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <FilterBar
            filters={[
              {
                id: 'organization',
                label: 'หน่วยงาน',
                type: 'select',
                paramKey: 'org',
                options: [
                  { value: '', label: 'ทั้งหมด' },
                  ...orgsAll.map((o: any) => ({ value: o.organization_id, label: o.name_th })),
                ],
              },
              {
                id: 'risk_level',
                label: 'ระดับความเสี่ยง',
                type: 'multiselect',
                paramKey: 'risk',
                options: [
                  { value: 'critical', label: 'วิกฤต' },
                  { value: 'red', label: 'เสี่ยงสูง' },
                  { value: 'amber', label: 'เฝ้าระวัง' },
                  { value: 'green', label: 'ปกติ' },
                ],
              },
            ]}
          />
          <Badge variant="secondary" className="text-xs">
            อัปเดตล่าสุด: {lastUpdated}
          </Badge>
        </div>
      </div>

      {/* Active filter echo */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>กำลังกรอง:</span>
          {filteredOrgName && <Badge variant="secondary">หน่วยงาน {filteredOrgName}</Badge>}
          {activeRiskLabels.length > 0 && (
            <Badge variant="secondary">ระดับความเสี่ยง {activeRiskLabels.join(', ')}</Badge>
          )}
          <Link href="/dashboard" className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
            ล้างตัวกรอง
          </Link>
        </div>
      )}

      {/* KPI Cards - Row 1: Core Metrics */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">ตัวชี้วัดหลัก</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="กำลังพลทั้งหมด"
            value={totalHeadcount.toLocaleString()}
            subtitle={`อัตรา ${totalQuota.toLocaleString()} | ว่าง ${totalVacant.toLocaleString()}`}
            icon={<Users className="w-5 h-5 text-primary" />}
            href="/personnel"
          />
          <KPICard
            title="อัตราว่าง"
            value={`${vacancyRate}%`}
            subtitle={`${totalVacant.toLocaleString()} ตำแหน่งจาก ${totalQuota.toLocaleString()} อัตรา`}
            icon={<TrendingDown className="w-5 h-5 text-amber-600" />}
            colorClass="bg-amber-500/10"
            href="/dashboard/vacancy"
          />
          <KPICard
            title="เกษียณใน 3 ปี"
            value={retiring3yr.toLocaleString()}
            subtitle="คนที่ต้องวางแผนสืบทอดตำแหน่ง"
            icon={<CalendarClock className="w-5 h-5 text-red-600" />}
            colorClass="bg-red-500/10"
            href="/dashboard/retirement"
          />
          <KPICard
            title="บุคลากรเสี่ยงสูง"
            value={highRiskCount.toLocaleString()}
            subtitle={`แจ้งเตือน ${alertCount} รายการ`}
            icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
            colorClass="bg-destructive/10"
            href="/dashboard/risk"
          />
        </div>
      </section>

      {/* KPI Cards - Row 2: Strategic Metrics */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">ตัวชี้วัดเชิงกลยุทธ์</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="ตำแหน่งสำคัญ"
            value={criticalPositions.toLocaleString()}
            subtitle="ตำแหน่งที่ต้องมีแผนสืบทอด"
            icon={<Target className="w-5 h-5 text-primary" />}
            colorClass="bg-primary/10"
            href="/dashboard/succession"
          />
          <KPICard
            title="อัตราการบรรจุ"
            value={`${fillRate}%`}
            subtitle={`${filledCount.toLocaleString()} คนจาก ${totalQuota.toLocaleString()} อัตรา`}
            icon={<UserCheck className="w-5 h-5 text-green-600" />}
            colorClass="bg-green-500/10"
            href="/dashboard/vacancy"
          />
          <KPICard
            title="หน่วยงานทั้งหมด"
            value={orgsAll.length.toLocaleString()}
            subtitle="กรม/กอง/สำนัก"
            icon={<Briefcase className="w-5 h-5 text-primary" />}
            colorClass="bg-primary/10"
            href="/personnel"
          />
          <KPICard
            title="สถานะระบบ"
            value="ปกติ"
            subtitle="บริการพร้อมใช้งาน"
            icon={<Activity className="w-5 h-5 text-green-600" />}
            colorClass="bg-green-500/10"
          />
        </div>
      </section>

      {/* Charts & Analytics Row */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">แนวโน้มและความเสี่ยง</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Retirement Timeline Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-primary" />
                แนวโน้มการเกษียณอายุ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RetirementTrendChart data={chartData} />
              <p className="text-xs text-muted-foreground mt-3 text-center">
                * แสดงเฉพาะ 3 ปีข้างหน้า จากข้อมูลทั้งหมด {retirementRows.length} คน
              </p>
            </CardContent>
          </Card>

          {/* Risk Distribution — true org-wide counts from all personnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                การกระจายความเสี่ยง
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { level: 'วิกฤต', count: riskDistribution.critical, color: 'bg-red-600', label: 'ต้องดูแลเร่งด่วน' },
                  { level: 'เสี่ยงสูง', count: riskDistribution.red, color: 'bg-red-500', label: 'ต้องติดตาม' },
                  { level: 'เฝ้าระวัง', count: riskDistribution.amber, color: 'bg-amber-500', label: 'ควรติดตาม' },
                  { level: 'ปกติ', count: riskDistribution.green, color: 'bg-green-500', label: 'ไม่มีความเสี่ยง' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} aria-hidden="true" />
                      <span className="text-sm font-medium">{item.level}</span>
                    </div>
                    <p className="text-2xl font-bold tabular-nums">{item.count}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                จากบุคลากรทั้งหมด {personnelTotal.toLocaleString()} คน
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* High Risk Personnel Table */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">บุคลากรเสี่ยงสูง</h2>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                รายบุคคลที่ต้องติดตาม
              </CardTitle>
              <Badge variant="destructive" className="text-xs">
                {highRiskCount} คน
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  รายชื่อบุคลากรเสี่ยงสูง จำนวน {highRiskCount} คน เรียงตามคะแนนความเสี่ยง
                </caption>
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">ชื่อ-นามสกุล</th>
                    <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">หน่วยงาน</th>
                    <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">ตำแหน่ง</th>
                    <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">คะแนนเสี่ยง</th>
                    <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">ระดับ</th>
                  </tr>
                </thead>
                <tbody>
                  {highRiskRows.map((p: any) => (
                    <tr key={p.id} className="border-b hover:bg-muted/50 transition-colors">
                      <th scope="row" className="py-3 px-4 font-medium text-left">
                        <Link
                          href={`/personnel/${p.id}`}
                          className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded text-foreground"
                        >
                          {p.full_name_th}
                        </Link>
                      </th>
                      <td className="py-3 px-4 text-muted-foreground">{p.organization_name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{p.position_name || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold tabular-nums ${getRiskTextColor(p.overall_risk_score ?? 0)}`}>
                          {p.overall_risk_score?.toFixed(0) || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={p.risk_level} score={p.overall_risk_score} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {highRiskRows.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
                <p>ไม่พบบุคลากรเสี่ยงสูงที่ตรงกับตัวกรอง</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Active Alerts */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">การแจ้งเตือนล่าสุด</h2>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                รายการแจ้งเตือน
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {alertCount} รายการ
                </Badge>
                <Link
                  href="/alerts"
                  className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  ดูทั้งหมด
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 list-none p-0 m-0">
              {alertRows.slice(0, 5).map((a: any) => {
                const severityTh =
                  a.severity === 'critical' ? 'วิกฤต' :
                  a.severity === 'warning' ? 'เตือน' : 'ข้อมูล'
                const severityClass =
                  a.severity === 'critical' ? 'bg-red-500' :
                  a.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                return (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 shrink-0 ${severityClass}`}
                      role="img"
                      aria-label={`ระดับ${severityTh}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {a.title}
                        <span className="sr-only"> — ระดับ{severityTh}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{a.message}</p>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        {a.organization_name && <span>{a.organization_name}</span>}
                        <span>{new Date(a.created_at).toLocaleDateString('th-TH')}</span>
                      </div>
                    </div>
                  </li>
                )
              })}
              {alertRows.length === 0 && (
                <li className="py-8 text-center text-muted-foreground text-sm">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" aria-hidden="true" />
                  ไม่มีการแจ้งเตือน
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">ดำเนินการต่อ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/retirement"
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          >
            <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
              <CardContent className="p-6 text-center">
                <CalendarClock className="w-8 h-8 mx-auto mb-3 text-primary" aria-hidden="true" />
                <h3 className="font-semibold mb-1">พยากรณ์เกษียณ</h3>
                <p className="text-xs text-muted-foreground">ดูแนวโน้มและการวางแผนสืบทอดตำแหน่ง</p>
              </CardContent>
            </Card>
          </Link>
          <Link
            href="/dashboard/risk"
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          >
            <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-destructive" aria-hidden="true" />
                <h3 className="font-semibold mb-1">วิเคราะห์ความเสี่ยง</h3>
                <p className="text-xs text-muted-foreground">ประเมินและจัดการความเสี่ยงด้านกำลังคน</p>
              </CardContent>
            </Card>
          </Link>
          <Link
            href="/dashboard/vacancy"
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          >
            <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingDown className="w-8 h-8 mx-auto mb-3 text-amber-600" aria-hidden="true" />
                <h3 className="font-semibold mb-1">อัตรากำลัง</h3>
                <p className="text-xs text-muted-foreground">วิเคราะห์อัตราว่างและความต้องการบุคลากร</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}
