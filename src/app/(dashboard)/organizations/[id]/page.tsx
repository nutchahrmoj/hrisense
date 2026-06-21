import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RiskBadge } from '@/components/personnel/risk-badge'
import { Users, BarChart3, CalendarClock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OrganizationDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()

  const [{ data: org, error: orgError }, { data: personnel, error: personnelError }] = await Promise.all([
    supabase.from('v_org_dashboard').select('*').eq('organization_id', params.id).single(),
    supabase.from('v_personnel_overview').select('*').eq('organization_id', params.id).order('full_name_th'),
  ])
  // .single() returns an error when no row matches; treat that as "not found", not a thrown error.
  if (orgError && orgError.code !== 'PGRST116') throw orgError
  if (personnelError) throw personnelError

  if (!org) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        ไม่พบข้อมูลหน่วยงาน
      </div>
    )
  }

  const kpis = [
    { label: 'บุคลากร', value: org.total_personnel, icon: Users },
    { label: 'อัตรากำลัง', value: org.total_quota, icon: BarChart3 },
    { label: 'ตำแหน่งว่าง', value: org.vacancy_count, icon: AlertTriangle, highlight: org.vacancy_count > 0 },
    { label: 'เกษียณใน 1 ปี', value: org.retirements_1yr, icon: CalendarClock },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{org.name_th}</h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-muted-foreground text-sm">{org.org_code} | ระดับ {org.level}</p>
          <RiskBadge level={org.risk_level} score={org.overall_risk_score} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <kpi.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className={`text-xl font-bold ${kpi.highlight ? 'text-amber-600' : ''}`}>
                    {kpi.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{org.overall_risk_score?.toFixed(0) || '—'}</p>
            <p className="text-xs text-muted-foreground">คะแนนความเสี่ยงรวม</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{org.retirements_3yr}</p>
            <p className="text-xs text-muted-foreground">เกษียณใน 3 ปี</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{org.retirements_5yr}</p>
            <p className="text-xs text-muted-foreground">เกษียณใน 5 ปี</p>
          </CardContent>
        </Card>
      </div>

      {/* Personnel Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>รายชื่อบุคลากร</CardTitle>
            <span className="text-sm text-muted-foreground">{personnel?.length || 0} คน</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">ชื่อ-นามสกุล</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">ตำแหน่ง</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">ระดับ</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">สถานะ</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">ความเสี่ยง</th>
                </tr>
              </thead>
              <tbody>
                {personnel?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      ไม่พบข้อมูลบุคลากร
                    </td>
                  </tr>
                ) : (
                  personnel?.map((p: any) => (
                    <tr key={p.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">
                        <Link
                          href={`/personnel/${p.id}`}
                          className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded text-foreground"
                        >
                          {p.full_name_th}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{p.position_name || '—'}</td>
                      <td className="py-3 px-4 text-muted-foreground">{p.position_level || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">
                          {p.status === 'active' ? 'ปฏิบัติงาน' : p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={p.risk_level} score={p.overall_risk_score} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
