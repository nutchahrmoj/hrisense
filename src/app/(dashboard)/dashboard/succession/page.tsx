import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RiskBadge } from '@/components/personnel/risk-badge'
import { ThaiDate } from '@/components/shared/thai-date'
import {
  Users, Target, CheckCircle2, XCircle, Clock,
  TrendingUp, Award, Briefcase, AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Row = Record<string, any>

export default async function SuccessionPage() {
  const supabase = await createServerSupabaseClient()

  const [criticalPositions, candidates, retirementTimeline] = await Promise.all([
    supabase.from('v_critical_positions').select('*'),
    supabase.from('v_succession_candidates').select('*'),
    supabase.from('v_retirement_timeline').select('personnel_id, full_name_th, position_name, organization_name, retirement_date, retirement_years_remaining, is_critical_position, has_ready_successor')
      .eq('is_critical_position', true)
      .order('retirement_date'),
  ])

  const positions = (criticalPositions.data || []) as Row[]
  const allCandidates = (candidates.data || []) as Row[]
  const retiringCritical = (retirementTimeline.data || []) as Row[]

  // Statistics
  const totalCritical = positions.length
  const withSuccessor = retiringCritical.filter(p => p.has_ready_successor).length
  const withoutSuccessor = retiringCritical.filter(p => !p.has_ready_successor).length
  const retiring1yr = retiringCritical.filter(p => (p.retirement_years_remaining || 99) <= 1).length
  const retiring3yr = retiringCritical.filter(p => (p.retirement_years_remaining || 99) <= 3).length

  // Group by organization
  const byOrg: Record<string, any[]> = {}
  positions.forEach(p => {
    const org = p.organization_name || 'อื่นๆ'
    if (!byOrg[org]) byOrg[org] = []
    byOrg[org].push(p)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">แผนสืบทอดตำแหน่ง</h1>
          <p className="text-muted-foreground text-sm mt-1">การบริหารตำแหน่งสำคัญและแผนพัฒนาผู้สืบทอด</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          อัปเดต: {new Date().toLocaleDateString('th-TH')}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">ทั้งหมด</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalCritical}</p>
            <p className="text-xs text-muted-foreground mt-1">ตำแหน่งสำคัญ</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-xs text-muted-foreground">พร้อม</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{withSuccessor}</p>
            <p className="text-xs text-muted-foreground mt-1">มีผู้สืบทอด</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-5 h-5 text-destructive" />
              <span className="text-xs text-muted-foreground">เสี่ยง</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{withoutSuccessor}</p>
            <p className="text-xs text-muted-foreground mt-1">ไม่มีผู้สืบทอด</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-xs text-muted-foreground">1 ปี</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{retiring1yr}</p>
            <p className="text-xs text-muted-foreground mt-1">เกษียณเร่งด่วน</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-muted-foreground">3 ปี</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{retiring3yr}</p>
            <p className="text-xs text-muted-foreground mt-1">ต้องวางแผน</p>
          </CardContent>
        </Card>
      </div>

      {/* Readiness Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            อัตราความพร้อมสืบทอดตำแหน่ง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ตำแหน่งที่มีผู้สืบทอดพร้อม</span>
              <span className="text-sm font-semibold">
                {totalCritical > 0 ? ((withSuccessor / totalCritical) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex gap-2 h-6 rounded-full overflow-hidden bg-muted">
              {withSuccessor > 0 && (
                <div
                  className="bg-green-500 transition-all duration-500 flex items-center justify-center text-xs text-white font-medium"
                  style={{ width: `${totalCritical > 0 ? (withSuccessor / totalCritical) * 100 : 0}%` }}
                >
                  {withSuccessor}
                </div>
              )}
              {withoutSuccessor > 0 && (
                <div
                  className="bg-destructive transition-all duration-500 flex items-center justify-center text-xs text-white font-medium"
                  style={{ width: `${totalCritical > 0 ? (withoutSuccessor / totalCritical) * 100 : 0}%` }}
                >
                  {withoutSuccessor}
                </div>
              )}
            </div>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>พร้อมสืบทอด ({withSuccessor})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span>ต้องพัฒนา ({withoutSuccessor})</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Positions Needing Attention */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              ตำแหน่งสำคัญที่ต้องเร่งพัฒนาผู้สืบทอด
            </CardTitle>
            <Badge variant="destructive" className="text-xs">
              {withoutSuccessor} ตำแหน่ง
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="ตำแหน่งสำคัญที่ต้องเร่งพัฒนาผู้สืบทอด">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">ตำแหน่ง</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">หน่วยงาน</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">ผู้ดำรงตำแหน่ง</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">เกษียณ</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">ปีเหลือ</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {retiringCritical.filter(p => !p.has_ready_successor).map((p, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{p.position_name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{p.organization_name}</td>
                    <td className="py-3 px-4">
                      <Link href={`/personnel/${p.personnel_id}`} className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded text-foreground">
                        {p.full_name_th}
                      </Link>
                    </td>
                    <td className="py-3 px-4"><ThaiDate date={p.retirement_date} /></td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'font-bold',
                        (p.retirement_years_remaining || 99) <= 1 && 'text-red-600',
                        (p.retirement_years_remaining || 99) <= 3 && (p.retirement_years_remaining || 99) > 1 && 'text-amber-600',
                        (p.retirement_years_remaining || 99) > 3 && 'text-foreground'
                      )}>
                        {p.retirement_years_remaining ?? '—'} ปี
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="destructive" className="text-xs">
                        <XCircle className="w-3 h-3 mr-1" />
                        ต้องเร่งพัฒนา
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {withoutSuccessor === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
              <p>ทุกตำแหน่งสำคัญมีผู้สืบทอดพร้อมแล้ว</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidates Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            ผู้มีศักยภาพสืบทอดตำแหน่ง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCandidates.slice(0, 6).map((c, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/personnel/${c.candidate_personnel_id ?? ''}`} className="font-medium truncate block hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                      {c.candidate_name}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">{c.current_position}</p>
                  </div>
                  <Badge
                    variant={c.readiness_level === 'ready' ? 'default' : 'secondary'}
                    className="text-xs shrink-0 ml-2"
                  >
                    {c.readiness_level === 'ready' ? 'พร้อม' : 'ต้องพัฒนา'}
                  </Badge>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">คะแนนความพร้อม</span>
                    <span className="font-semibold">{c.readiness_score?.toFixed(0) || '—'}/100</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        (c.readiness_score || 0) >= 70 ? 'bg-green-500' :
                        (c.readiness_score || 0) >= 50 ? 'bg-amber-500' : 'bg-destructive'
                      )}
                      style={{ width: `${c.readiness_score || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">ตำแหน่งเป้าหมาย</span>
                    <span className="font-medium text-right truncate ml-2 max-w-[150px]">{c.target_position}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {allCandidates.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>ยังไม่มีข้อมูลผู้สืบทอด</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Development Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            ข้อเสนอแนะการพัฒนา
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: 'เร่งพัฒนาผู้สืบทอดตำแหน่งที่เกษียณใน 1 ปี',
                description: `มี ${retiring1yr} ตำแหน่งสำคัญที่ต้องเกษียณใน 1 ปี แต่ยังไม่มีผู้สืบทอดที่พร้อม`,
                priority: 'critical',
                action: 'จัดทำแผนเร่งด่วน'
              },
              {
                title: 'สร้าง Talent Pool สำหรับตำแหน่งบริหาร',
                description: 'พัฒนาบุคลากรที่มีศักยภาพสูงเพื่อเตรียมความพร้อมสำหรับตำแหน่งบริหารในอนาคต',
                priority: 'high',
                action: 'คัดเลือกและพัฒนา'
              },
              {
                title: 'ถ่ายทอดองค์ความรู้จากผู้นิยามตำแหน่ง',
                description: 'จัดทำระบบ KM เพื่อบันทึกและถ่ายทอดความรู้จากบุคลากรที่จะเกษียณ',
                priority: 'medium',
                action: 'จัดทำแผน KM'
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
                  {rec.priority === 'high' && <TrendingUp className="w-5 h-5 text-amber-600" />}
                  {rec.priority === 'medium' && <Briefcase className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {rec.action}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
