import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RiskBadge } from '@/components/personnel/risk-badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PersonnelPage() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('v_personnel_overview').select('*').limit(100)
  if (error) throw error

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">ข้อมูลบุคลากร</h1><p className="text-muted-foreground text-sm mt-1">รายชื่อบุคลากรทั้งหมด ({data?.length || 0} คน)</p></div>
      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-3 px-4 text-muted-foreground font-medium">ชื่อ-นามสกุล</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">หน่วยงาน</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">ตำแหน่ง</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">ระดับ</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">สถานะ</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">ความเสี่ยง</th></tr></thead>
            <tbody>{data?.map((p: any) => (
              <tr key={p.id} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4 font-medium">
                  <Link href={`/personnel/${p.id}`} className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded text-foreground">
                    {p.full_name_th}
                  </Link>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{p.organization_name}</td>
                <td className="py-3 px-4 text-muted-foreground">{p.position_name||'—'}</td>
                <td className="py-3 px-4 text-muted-foreground">{p.position_level||'—'}</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">{p.status==='active'?'ปฏิบัติงาน':p.status}</span></td>
                <td className="py-3 px-4"><RiskBadge level={p.risk_level} score={p.overall_risk_score}/></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent></Card>
    </div>
  )
}
