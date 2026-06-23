import { createServerSupabaseClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RiskBadge } from '@/components/personnel/risk-badge'
import { ThaiDate } from '@/components/shared/thai-date'

export const dynamic = 'force-dynamic'

export default async function PersonnelDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: person } = await supabase
    .from('v_personnel_overview')
    .select('*')
    .eq('id', params.id)
    .single() as { data: any }

  if (!person) return <div className="p-6 text-center text-muted-foreground">ไม่พบข้อมูล</div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">{person.full_name_th}</h1><p className="text-muted-foreground text-sm">{person.organization_name} | {person.position_name || 'ไม่มีตำแหน่ง'}</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>ข้อมูลส่วนตัว</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">เลขบัตรประชาชน</span><span>{person.citizen_id ? 'XXX-XXX-X' + person.citizen_id.slice(-4) : '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">วันเกิด</span><span><ThaiDate date={person.birth_date}/></span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">วันเกษียณ</span><span><ThaiDate date={person.retirement_date}/></span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">เงินเดือน</span><span>{person.salary ? person.salary.toLocaleString() + ' บาท' : '—'}</span></div>
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle>ประเมินความเสี่ยง</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <RiskBadge level={person.risk_level} score={person.overall_risk_score} size="md" />
              <p className="text-3xl font-bold mt-2">{person.overall_risk_score?.toFixed(0) || '—'}</p>
              <p className="text-xs text-muted-foreground">คะแนนความเสี่ยงรวม</p>
            </div>
            <div className="space-y-2">{[{l:'เกษียณ',v:person.retirement_risk,c:'bg-red-500'},{l:'โอนย้าย',v:person.transfer_risk,c:'bg-amber-500'},{l:'สูญเสียทาเลนท์',v:person.talent_loss_risk,c:'bg-amber-500'},{l:'เหนื่อยล้า (Burnout)',v:(person as any).burnout_risk,c:'bg-orange-500'}].map((f: any) => (
              <div key={f.l}><div className="flex justify-between text-sm"><span>{f.l}</span><span>{f.v?.toFixed(0)||'—'}</span></div><div className="h-2 bg-muted rounded-full mt-1"><div className={cn('h-full rounded-full', f.c)} style={{width: (f.v||0) + '%'}}/></div></div>
            ))}</div>
          </CardContent>
        </Card>
      </div>

      {/* Burnout breakdown — shows the behavioral inputs that drive burnout_risk
          so the score is explainable, not a black box. */}
      {(() => {
        const bf = (person as any).burnout_factors
        if (!bf) return null
        const br = person.burnout_risk ?? 0
        const rows = [
          { label: 'การมาสาย (วัน/ปี)', value: bf.late_days_ytd, max: 20, unit: 'วัน', weight: 0.15, risk: 'สูงขึ้น', c: 'bg-orange-500' },
          { label: 'การขาดงาน (วัน/ปี)', value: bf.absent_days_ytd, max: 15, unit: 'วัน', weight: 0.15, risk: 'สูงขึ้น', c: 'bg-orange-500' },
          { label: 'ผลการประเมินล่าสุด', value: bf.performance_score, max: 100, unit: 'คะแนน', weight: 0.20, risk: 'ต่ำลง', c: 'bg-amber-500', invert: true },
          { label: 'ล่วงเวลา (ชม./ปี)', value: bf.overtime_hours_ytd, max: 240, unit: 'ชม.', weight: 0.20, risk: 'สูงขึ้น', c: 'bg-red-500' },
          { label: 'การฝึกอบรมพัฒนา (ชม./ปี)', value: bf.training_hours_ytd, max: 40, unit: 'ชม.', weight: 0.10, risk: 'ต่ำลง', c: 'bg-green-500', invert: true, protective: true },
          { label: 'ภาระงาน', value: bf.workload_index, max: 100, unit: '%', weight: 0.20, risk: 'สูงขึ้น', c: 'bg-red-500' },
        ]
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>ปัจจัยเสี่ยงเหนื่อยล้า (Burnout)</CardTitle>
                <div className="text-right">
                  <span className="text-2xl font-bold tabular-nums">{br.toFixed(0)}</span>
                  <span className="text-xs text-muted-foreground ml-1">/ 100</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                คำนวณจากข้อมูลพฤติกรรมและผลการประเมิน 6 ด้าน (ถ่วงน้ำหนัก) — ไม่ใช่การประเมินเชิงอัตวิสัย
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {rows.map((r) => {
                const pct = Math.max(0, Math.min(100, (r.value / r.max) * 100))
                const contribution = (r.invert ? (100 - pct) : pct) * r.weight
                return (
                  <div key={r.label} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-4 items-center">
                    <div className="min-w-0">
                      <div className="flex justify-between text-sm">
                        <span>{r.label}{r.protective && <span className="text-green-600 ml-1">(ป้องกัน)</span>}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {r.value} {r.unit} · น้ำหนัก {(r.weight * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full mt-1">
                        <div className={cn('h-full rounded-full', r.c)} style={{ width: pct + '%' }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ความเสี่ยง{r.risk}เมื่อค่า{r.invert ? 'ต่ำ' : 'สูง'} · สมทบ {contribution.toFixed(1)} คะแนน
                      </p>
                    </div>
                  </div>
                )
              })}
              <div className="pt-3 border-t flex justify-between text-sm">
                <span className="font-medium">คะแนน Burnout รวม</span>
                <span className="font-bold tabular-nums">{br.toFixed(1)} / 100</span>
              </div>
            </CardContent>
          </Card>
        )
      })()}
    </div>
  )
}
