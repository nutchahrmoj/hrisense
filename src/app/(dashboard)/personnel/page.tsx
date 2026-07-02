import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PersonnelListTable } from '@/components/personnel/personnel-list-table'
import { mergePersonnelBurnout } from '@/lib/utils/personnel-burnout'

export const dynamic = 'force-dynamic'

export default async function PersonnelPage() {
  const supabase = await createServerSupabaseClient()
  const [{ data, error }, { data: burnoutData }] = await Promise.all([
    supabase
      .from('v_personnel_overview')
      .select('*')
      .eq('status', 'active'),
    supabase
      .from('v_burnout_analysis')
      .select('personnel_id,burnout_risk,late_days_ytd,absent_days_ytd,performance_score,overtime_hours_ytd,training_hours_ytd,workload_index'),
  ])
  
  if (error) throw error
  const personnel = mergePersonnelBurnout(data || [], burnoutData as any[] | null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ข้อมูลบุคลากร</h1>
        <p className="text-muted-foreground text-sm mt-1">
          รายชื่อและการวิเคราะห์ระดับความเสี่ยงของกำลังพลรายบุคคล
        </p>
      </div>
      <PersonnelListTable personnel={personnel} />
    </div>
  )
}
