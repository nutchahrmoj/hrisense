import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThaiDate } from '@/components/shared/thai-date'
import {
  Briefcase, Users, AlertTriangle, TrendingDown,
  Target, CheckCircle2, XCircle, BarChart3,
  PieChart, Filter, Download, ChevronRight,
  Building2, Award
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export const dynamic = 'force-dynamic'

type Row = Record<string, any>

export default async function VacancyPage() {
  const supabase = await createServerSupabaseClient()

  const [vacancyData, orgVacancy, criticalVacancies, recruitmentData] = await Promise.all([
    supabase.from('v_vacancy_analysis').select('*').order('vacancy_rate_pct', { ascending: false }),
    supabase.from('v_org_vacancy_summary').select('*'),
    supabase.from('v_critical_vacancies').select('*'),
    supabase.from('v_recruitment_pipeline').select('*').limit(10),
  ])

  const positions = (vacancyData.data || []) as Row[]
  const orgSummary = (orgVacancy.data || []) as Row[]
  const critical = (criticalVacancies.data || []) as Row[]
  const recruitment = (recruitmentData.data || []) as Row[]

  // Statistics
  const totalQuota = positions.reduce((s:number,v:any)=>s+(v.quota||0),0) || 0
  const totalFilled = positions.reduce((s:number,v:any)=>s+(v.current_occupancy||0),0) || 0
  const totalVacant = positions.reduce((s:number,v:any)=>s+(v.vacancy_count||0),0) || 0
  const overallRate = totalQuota > 0 ? ((totalVacant/totalQuota)*100).toFixed(1) : '0'
  const criticalVacant = critical.filter(v => v.vacancy_count > 0).length || 0
  const departmentsWithVacancy = orgSummary.filter(o => o.vacancy_count > 0).length || 0

  // Group by vacancy rate ranges
  const highVacancy = positions.filter(v => (v.vacancy_rate_pct || 0) >= 20).length
  const mediumVacancy = positions.filter(v => (v.vacancy_rate_pct || 0) >= 10 && (v.vacancy_rate_pct || 0) < 20).length
  const lowVacancy = positions.filter(v => (v.vacancy_rate_pct || 0) < 10 && (v.vacancy_rate_pct || 0) > 0).length
  const noVacancy = positions.filter(v => (v.vacancy_rate_pct || 0) === 0).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">วิเคราะห์อัตรากำลัง</h1>
          <p className="text-muted-foreground text-sm mt-1">สถานการณ์อัตราว่างและการบรรจุกำลังคน</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">
            <Filter className="w-3 h-3 mr-1" />
            กรองข้อมูล
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Download className="w-3 h-3 mr-1" />
            ส่งออก
          </Badge>
        </div>
      </div>

      {/* KPI Cards - Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">ทั้งหมด</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalQuota.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">อัตราทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-xs text-muted-foreground">บรรจุแล้ว</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{totalFilled.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">คน</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-5 h-5 text-destructive" />
              <span className="text-xs text-muted-foreground">ว่าง</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{totalVacant.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">ตำแหน่ง</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-5 h-5 text-amber-600" />
              <span className="text-xs text-muted-foreground">อัตราว่าง</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{overallRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">ของอัตราทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-xs text-muted-foreground">สำคัญ</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{criticalVacant}</p>
            <p className="text-xs text-muted-foreground mt-1">ตำแหน่งสำคัญว่าง</p>
          </CardContent>
        </Card>
      </div>

      {/* Vacancy Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vacancy Rate Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              การกระจายอัตราว่างตามช่วง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { range: 'ว่าง ≥20%', count: highVacancy, total: positions.length, color: 'bg-destructive', textColor: 'text-destructive' },
                { range: 'ว่าง 10-19%', count: mediumVacancy, total: positions.length, color: 'bg-amber-500', textColor: 'text-amber-600' },
                { range: 'ว่าง 1-9%', count: lowVacancy, total: positions.length, color: 'bg-blue-500', textColor: 'text-blue-600' },
                { range: 'ไม่ว่าง', count: noVacancy, total: positions.length, color: 'bg-green-500', textColor: 'text-green-600' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.range}</span>
                    <span className={`text-sm font-bold ${item.textColor}`}>{item.count}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {item.total > 0 ? ((item.count / item.total) * 100).toFixed(1) : 0}% ของตำแหน่งทั้งหมด
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Organization Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              สรุปตามหน่วยงาน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg border bg-card">
                <p className="text-2xl font-bold text-primary">{orgSummary.length}</p>
                <p className="text-xs text-muted-foreground mt-1">หน่วยงานทั้งหมด</p>
              </div>
              <div className="text-center p-3 rounded-lg border bg-card">
                <p className="text-2xl font-bold text-amber-600">{departmentsWithVacancy}</p>
                <p className="text-xs text-muted-foreground mt-1">มีอัตราว่าง</p>
              </div>
            </div>
            <div className="space-y-2">
              {orgSummary.slice(0, 5).map((o, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{o.organization_name}</p>
                    <p className="text-xs text-muted-foreground">
                      ว่าง {o.vacancy_count} จาก {o.total_quota}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className={cn(
                      'text-sm font-bold',
                      (o.vacancy_rate || 0) >= 15 ? 'text-destructive' :
                      (o.vacancy_rate || 0) >= 10 ? 'text-amber-600' : 'text-green-600'
                    )}>
                      {o.vacancy_rate?.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Vacancies Alert */}
      {critical.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                ตำแหน่งสำคัญที่ว่างอยู่ (ต้องเร่งบรรจุ)
              </CardTitle>
              <Badge variant="destructive" className="text-xs">
                {critical.filter(v => v.vacancy_count > 0).length} ตำแหน่ง
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table" aria-label="ตำแหน่งสำคัญที่ว่างอยู่">
                <thead>
                  <tr className="border-b bg-destructive/10">
                    <th className="text-left py-3 px-4 font-medium text-destructive" scope="col">รหัส</th>
                    <th className="text-left py-3 px-4 font-medium text-destructive" scope="col">ตำแหน่ง</th>
                    <th className="text-left py-3 px-4 font-medium text-destructive" scope="col">หน่วยงาน</th>
                    <th className="text-right py-3 px-4 font-medium text-destructive" scope="col">อัตรา</th>
                    <th className="text-right py-3 px-4 font-medium text-destructive" scope="col">ว่าง</th>
                    <th className="text-right py-3 px-4 font-medium text-destructive" scope="col">%ว่าง</th>
                    <th className="text-center py-3 px-4 font-medium text-destructive" scope="col">ลำดับความสำคัญ</th>
                  </tr>
                </thead>
                <tbody>
                  {critical.filter(v => v.vacancy_count > 0).map((v, idx) => (
                    <tr key={idx} className="border-b hover:bg-destructive/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs">{v.position_code}</td>
                      <td className="py-3 px-4 font-medium">{v.position_name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{v.organization_name}</td>
                      <td className="py-3 px-4 text-right">{v.quota}</td>
                      <td className="py-3 px-4 text-right font-bold text-destructive">{v.vacancy_count}</td>
                      <td className="py-3 px-4 text-right font-bold text-destructive">{v.vacancy_rate_pct?.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="destructive" className="text-xs">
                          เร่งด่วน
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Vacancy Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              รายละเอียดอัตรารายตำแหน่ง
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {positions.length} ตำแหน่ง
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="รายละเอียดอัตรารายตำแหน่ง">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">รหัส</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">ตำแหน่ง</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">หน่วยงาน</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground" scope="col">อัตรา</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground" scope="col">มี</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground" scope="col">ว่าง</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground" scope="col">%ว่าง</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground" scope="col">สำคัญ</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((v, idx) => {
                  const highlight = v.is_critical && v.vacancy_count > 0
                  return (
                    <tr
                      key={idx}
                      className={cn(
                        'border-b hover:bg-muted/50 transition-colors',
                        highlight && 'bg-red-50/30'
                      )}
                    >
                      <td className="py-3 px-4 font-mono text-xs">{v.position_code}</td>
                      <td className="py-3 px-4 font-medium">{v.position_name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{v.organization_name}</td>
                      <td className="py-3 px-4 text-right">{v.quota}</td>
                      <td className="py-3 px-4 text-right">{v.current_occupancy}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={cn(
                          'font-semibold',
                          v.vacancy_count > 0 && 'text-destructive'
                        )}>
                          {v.vacancy_count}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={cn(
                          'font-bold',
                          (v.vacancy_rate_pct || 0) >= 20 && 'text-destructive',
                          (v.vacancy_rate_pct || 0) >= 10 && (v.vacancy_rate_pct || 0) < 20 && 'text-amber-600',
                          (v.vacancy_rate_pct || 0) > 0 && (v.vacancy_rate_pct || 0) < 10 && 'text-blue-600',
                          (v.vacancy_rate_pct || 0) === 0 && 'text-green-600'
                        )}>
                          {v.vacancy_rate_pct?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {v.is_critical && (
                          <Badge variant="outline" className="text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            สำคัญ
                          </Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {positions.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>ไม่มีข้อมูลอัตรากำลัง</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recruitment Pipeline */}
      {recruitment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              สถานะการสรรหาและบรรจุ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recruitment.map((r, idx) => (
                <div key={idx} className="p-4 rounded-lg border bg-card flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate">{r.position_name}</h3>
                      <Badge
                        variant={r.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs shrink-0 ml-2"
                      >
                        {r.status === 'completed' ? 'บรรจุแล้ว' :
                         r.status === 'in_progress' ? 'กำลังดำเนินการ' : 'รอดำเนินการ'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{r.organization_name}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>📅 เปิดรับ: <ThaiDate date={r.posted_date} format="short" /></span>
                      <span>👥 สมัคร: {r.applicants_count || 0} คน</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            ข้อเสนอแนะ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'เร่งบรรจุตำแหน่งสำคัญ',
                description: `มี ${criticalVacant} ตำแหน่งสำคัญที่ยังว่างอยู่ ควรเร่งกระบวนการสรรหาและบรรจุ`,
                priority: 'critical',
                action: 'ดำเนินการทันที'
              },
              {
                title: 'ทบทวนโครงสร้างอัตรากำลัง',
                description: 'หน่วยงานที่มีอัตราว่างสูงควรทบทวนความเหมาะสมของโครงสร้างและภารกิจ',
                priority: 'high',
                action: 'ทบทวนภายใน 30 วัน'
              },
              {
                title: 'พัฒนาแผนสรรหาระยะยาว',
                description: 'จัดทำแผนสรรหาและบรรจุกำลังคนล่วงหน้า 1-3 ปี เพื่อป้องกันปัญหาขาดแคลน',
                priority: 'medium',
                action: 'จัดทำแผนรายปี'
              },
              {
                title: 'ปรับปรุงกระบวนการสรรหา',
                description: 'ลดระยะเวลาการสรรหาจากประกาศถึงบรรจุให้สั้นลง เพื่อรักษาผู้สมัครคุณภาพ',
                priority: 'medium',
                action: 'ปรับปรุงกระบวนการ'
              },
            ].map((rec, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-card flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                  rec.priority === 'critical' && 'bg-red-100',
                  rec.priority === 'high' && 'bg-amber-100',
                  rec.priority === 'medium' && 'bg-blue-100'
                )}>
                  {rec.priority === 'critical' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  {rec.priority === 'high' && <TrendingDown className="w-5 h-5 text-amber-600" />}
                  {rec.priority === 'medium' && <Target className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {rec.action}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
