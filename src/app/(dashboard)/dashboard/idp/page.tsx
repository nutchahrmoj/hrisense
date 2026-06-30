import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThaiDate } from '@/components/shared/thai-date'
import {
  BookOpen, Target, TrendingUp, Award,
  Calendar, CheckCircle2, Clock, Users,
  GraduationCap, Briefcase, Star
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Row = Record<string, any>

export default async function IDPPage() {
  const supabase = await createServerSupabaseClient()

  const [idpPlans, trainingRecords, highPotentials] = await Promise.all([
    supabase.from('v_idp_summary').select('*'),
    supabase.from('v_training_records').select('*').limit(50),
    supabase.from('v_high_potential_personnel').select('*').limit(20),
  ])

  const plans = (idpPlans.data || []) as Row[]
  const trainings = (trainingRecords.data || []) as Row[]
  const hiPos = (highPotentials.data || []) as Row[]

  // Statistics
  const totalPlans = plans.length
  const completedPlans = plans.filter(p => p.status === 'completed').length
  const inProgressPlans = plans.filter(p => p.status === 'in_progress').length
  const pendingPlans = plans.filter(p => p.status === 'pending').length
  const totalTrainingHours = trainings.reduce((sum: number, t: any) => sum + (t.training_hours || 0), 0)

  // Group by year
  const byYear: Record<number, number> = {}
  plans.forEach(p => {
    const year = p.plan_year || new Date().getFullYear() + 543
    byYear[year] = (byYear[year] || 0) + 1
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">แผนพัฒนารายบุคคล</h1>
          <p className="text-muted-foreground text-sm mt-1">Individual Development Plan (IDP) และการพัฒนาบุคลากร</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          ปีงบประมาณ {new Date().getFullYear() + 543}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">ทั้งหมด</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalPlans}</p>
            <p className="text-xs text-muted-foreground mt-1">แผนพัฒนาทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-xs text-muted-foreground">เสร็จแล้ว</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{completedPlans}</p>
            <p className="text-xs text-muted-foreground mt-1">แผนสำเร็จ</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-xs text-muted-foreground">ดำเนินการ</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{inProgressPlans}</p>
            <p className="text-xs text-muted-foreground mt-1">กำลังดำเนินการ</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-muted-foreground">ชั่วโมง</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{totalTrainingHours.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">ชั่วโมงฝึกอบรม</p>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            อัตราความสำเร็จแผนพัฒนา
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {totalPlans > 0 ? ((completedPlans / totalPlans) * 100).toFixed(0) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">สำเร็จ</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">
                  {totalPlans > 0 ? ((inProgressPlans / totalPlans) * 100).toFixed(0) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">ดำเนินการ</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-muted-foreground">
                  {totalPlans > 0 ? ((pendingPlans / totalPlans) * 100).toFixed(0) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">รอดำเนินการ</p>
              </div>
            </div>
            <div className="flex gap-2 h-4 rounded-full overflow-hidden bg-muted">
              {completedPlans > 0 && (
                <div
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0}%` }}
                />
              )}
              {inProgressPlans > 0 && (
                <div
                  className="bg-amber-500 transition-all duration-500"
                  style={{ width: `${totalPlans > 0 ? (inProgressPlans / totalPlans) * 100 : 0}%` }}
                />
              )}
              {pendingPlans > 0 && (
                <div
                  className="bg-muted-foreground/30 transition-all duration-500"
                  style={{ width: `${totalPlans > 0 ? (pendingPlans / totalPlans) * 100 : 0}%` }}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Potential Personnel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              บุคลากรศักยภาพสูง (Hi-Po)
            </CardTitle>
            <Badge className="text-xs">
              {hiPos.length} คน
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hiPos.slice(0, 6).map((p, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {p.full_name_th?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/personnel/${p.personnel_id ?? p.id ?? ''}`} className="font-semibold truncate block hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                      {p.full_name_th}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">{p.position_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.organization_name}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">คะแนนศักยภาพ</span>
                    <span className="font-bold text-amber-600">{p.potential_score?.toFixed(0) || '—'}/100</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                      style={{ width: `${p.potential_score || 0}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <GraduationCap className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">
                      {p.education_level || '—'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {hiPos.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>ยังไม่มีข้อมูลบุคลากรศักยภาพสูง</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Training Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            กิจกรรมการฝึกอบรมล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="กิจกรรมการฝึกอบรมล่าสุด">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">หลักสูตร</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">ผู้เข้าอบรม</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">หน่วยงาน</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">วันที่</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">ชั่วโมง</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {trainings.slice(0, 10).map((t, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{t.course_name}</p>
                        <p className="text-xs text-muted-foreground">{t.course_type}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {t.personnel_id ? (
                        <Link href={`/personnel/${t.personnel_id}`} className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded text-foreground">
                          {t.personnel_name}
                        </Link>
                      ) : (
                        t.personnel_name
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{t.organization_name}</td>
                    <td className="py-3 px-4">
                      <div className="text-xs">
                        <p><ThaiDate date={t.start_date} format="short" /></p>
                        <p className="text-muted-foreground">ถึง <ThaiDate date={t.end_date} format="short" /></p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold">{t.training_hours}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={t.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {t.status === 'completed' ? 'เสร็จแล้ว' : t.status === 'in_progress' ? 'กำลังดำเนินการ' : 'รอดำเนินการ'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {trainings.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>ยังไม่มีข้อมูลการฝึกอบรม</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Development Focus Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            สายงานที่ต้องการพัฒนาเร่งด่วน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                area: 'ผู้บริหารระดับสูง',
                icon: '',
                count: 15,
                priority: 'critical',
                focus: 'ภาวะผู้นำและการบริหารจัดการ'
              },
              {
                area: 'สายนิติการ',
                icon: '⚖️',
                count: 28,
                priority: 'high',
                focus: 'ความรู้กฎหมายและกระบวนการยุติธรรม'
              },
              {
                area: 'สาย IT และดิจิทัล',
                icon: '💻',
                count: 22,
                priority: 'high',
                focus: 'เทคโนโลยีและนวัตกรรมดิจิทัล'
              },
              {
                area: 'สายบริหารงานบุคคล',
                icon: '👥',
                count: 18,
                priority: 'medium',
                focus: 'HR Modernization และ Data Analytics'
              },
            ].map((area, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{area.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{area.area}</h3>
                      <Badge
                        variant={area.priority === 'critical' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {area.priority === 'critical' ? 'เร่งด่วน' : area.priority === 'high' ? 'สำคัญ' : 'ปานกลาง'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{area.focus}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{area.count} คนต้องการพัฒนา</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            แผนการพัฒนาที่แนะนำ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: 'จัดทำ IDP สำหรับบุคลากรศักยภาพสูง',
                description: 'พัฒนาแผนพัฒนารายบุคคลเฉพาะสำหรับ Hi-Po Talents เพื่อรักษาและพัฒนาศักยภาพ',
                timeline: 'ภายใน 3 เดือน',
                owner: 'กองการเจ้าหน้าที่'
              },
              {
                title: 'โปรแกรม Mentoring สำหรับผู้สืบทอดตำแหน่ง',
                description: 'จับคู่ Mentor-Mentee ระหว่างผู้มีประสบการณ์กับผู้เตรียมสืบทอดตำแหน่ง',
                timeline: '6 เดือน',
                owner: 'ทุกหน่วยงาน'
              },
              {
                title: 'ฝึกอบรมภาวะผู้นำสำหรับผู้บริหารใหม่',
                description: 'หลักสูตรพัฒนาภาวะผู้นำสำหรับผู้ที่จะได้รับการโปรโมทเป็นผู้บริหาร',
                timeline: 'รายปี',
                owner: 'สำนักงานปลัดกระทรวง'
              },
            ].map((plan, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-card flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{plan.title}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>📅 {plan.timeline}</span>
                    <span>👤 {plan.owner}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
