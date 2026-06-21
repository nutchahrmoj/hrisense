import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThaiDate } from '@/components/shared/thai-date'
import Link from 'next/link'
import { RiskBadge } from '@/components/personnel/risk-badge'
import { CalendarDays, AlertTriangle, Users, CheckCircle2, XCircle, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export const dynamic = 'force-dynamic'

export default async function RetirementPage() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('v_retirement_timeline').select('*').order('retirement_date')
  if (error) throw error

  const retiring1yr = data?.filter((r: any) => (r.retirement_years_remaining || 99) <= 1).length || 0
  const retiring3yr = data?.filter((r: any) => (r.retirement_years_remaining || 99) <= 3).length || 0
  const retiring5yr = data?.filter((r: any) => (r.retirement_years_remaining || 99) <= 5).length || 0
  const criticalAtRisk = data?.filter((r: any) => r.is_critical_position && (r.retirement_years_remaining || 99) <= 3).length || 0
  const withSuccessor = data?.filter((r: any) => r.has_ready_successor).length || 0
  const withoutSuccessor = data?.filter((r: any) => !r.has_ready_successor && (r.retirement_years_remaining || 99) <= 5).length || 0

  // Group by year for timeline
  const byYear: Record<number, any[]> = {}
  data?.forEach((r: any) => {
    if (r.retirement_date) {
      const year = new Date(r.retirement_date).getFullYear() + 543
      if (!byYear[year]) byYear[year] = []
      byYear[year].push(r)
    }
  })
  const sortedYears = Object.entries(byYear).sort(([a], [b]) => Number(a) - Number(b)).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">พยากรณ์เกษียณอายุ</h1>
          <p className="text-muted-foreground text-sm mt-1">แนวโน้มการเกษียณอายุและการวางแผนสืบทอดตำแหน่ง</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="w-4 h-4" />
          <span>อัปเดตล่าสุด: <ThaiDate date={new Date()} format="short" /></span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-red-100">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-xs text-muted-foreground">1 ปี</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{retiring1yr}</p>
            <p className="text-xs text-muted-foreground mt-1">เกษียณใน 1 ปี</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-amber-100">
                <TrendingDown className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs text-muted-foreground">3 ปี</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{retiring3yr}</p>
            <p className="text-xs text-muted-foreground mt-1">เกษียณใน 3 ปี</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingDown className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-muted-foreground">5 ปี</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{retiring5yr}</p>
            <p className="text-xs text-muted-foreground mt-1">เกษียณใน 5 ปี</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <span className="text-xs text-muted-foreground">วิกฤต</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{criticalAtRisk}</p>
            <p className="text-xs text-muted-foreground mt-1">ตำแหน่งสำคัญเสี่ยง</p>
          </CardContent>
        </Card>
      </div>

      {/* Succession Planning Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              สถานะการสืบทอดตำแหน่ง
            </CardTitle>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-muted-foreground">มีผู้สืบทอด: <strong className="text-foreground">{withSuccessor}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-muted-foreground">ไม่มี: <strong className="text-destructive">{withoutSuccessor}</strong></span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 h-4 rounded-full overflow-hidden bg-muted">
            {withSuccessor > 0 && (
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${(withSuccessor / (withSuccessor + withoutSuccessor)) * 100}%` }}
                title={`มีผู้สืบทอด: ${withSuccessor}`}
              />
            )}
            {withoutSuccessor > 0 && (
              <div
                className="bg-destructive transition-all"
                style={{ width: `${(withoutSuccessor / (withSuccessor + withoutSuccessor)) * 100}%` }}
                title={`ไม่มีผู้สืบทอด: ${withoutSuccessor}`}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            อัตราการเตรียมผู้สืบทอด: {((withSuccessor / (withSuccessor + withoutSuccessor)) * 100).toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      {/* Timeline by Year */}
      <Card>
        <CardHeader>
          <CardTitle>เส้นเวลาการเกษียณ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedYears.map(([year, people]) => (
              <div key={year} className="border-l-2 border-primary/20 pl-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">ปี พ.ศ. {year}</h3>
                  <span className="text-sm text-muted-foreground">{people.length} คน</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {people.slice(0, 6).map((p: any) => (
                    <div key={p.personnel_id} className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <Link href={`/personnel/${p.personnel_id}`} className="font-medium text-sm truncate hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded block">
                            {p.full_name_th}
                          </Link>
                          <p className="text-xs text-muted-foreground truncate">{p.organization_name}</p>
                        </div>
                        {p.has_ready_successor ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 ml-2" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive shrink-0 ml-2" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{p.position_name || '—'}</span>
                        <span className={cn(
                          'font-medium',
                          (p.retirement_years_remaining || 99) <= 1 && 'text-red-600',
                          (p.retirement_years_remaining || 99) <= 3 && (p.retirement_years_remaining || 99) > 1 && 'text-amber-600',
                          (p.retirement_years_remaining || 99) > 3 && 'text-muted-foreground'
                        )}>
                          {p.retirement_years_remaining ?? '—'} ปี
                        </span>
                      </div>
                    </div>
                  ))}
                  {people.length > 6 && (
                    <div className="p-3 rounded-lg border bg-muted/50 flex items-center justify-center text-sm text-muted-foreground">
                      และอีก {people.length - 6} คน
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายชื่อเกษียณอายุทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="รายชื่อบุคลากรที่จะเกษียณอายุ">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">ชื่อ-นามสกุล</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">หน่วยงาน</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">ตำแหน่ง</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">วันเกษียณ</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">ปีเหลือ</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">สถานะ</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">ผู้สืบทอด</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((r: any) => (
                  <tr key={r.personnel_id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">
                      <Link href={`/personnel/${r.personnel_id}`} className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded text-foreground">
                        {r.full_name_th}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{r.organization_name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{r.position_name || '—'}</td>
                    <td className="py-3 px-4"><ThaiDate date={r.retirement_date} /></td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'font-medium',
                        (r.retirement_years_remaining || 99) <= 1 && 'text-red-600',
                        (r.retirement_years_remaining || 99) <= 3 && (r.retirement_years_remaining || 99) > 1 && 'text-amber-600',
                        (r.retirement_years_remaining || 99) > 3 && 'text-foreground'
                      )}>
                        {r.retirement_years_remaining ?? '—'} ปี
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {r.is_critical_position && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          วิกฤต
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {r.has_ready_successor ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs">พร้อม</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs">ไม่มี</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!data || data.length === 0) && (
            <div className="py-12 text-center text-muted-foreground">
              <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>ไม่พบข้อมูลการเกษียณอายุ</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
