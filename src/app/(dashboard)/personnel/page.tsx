import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PersonnelListTable } from '@/components/personnel/personnel-list-table'

export const dynamic = 'force-dynamic'

export default async function PersonnelPage() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('v_personnel_overview')
    .select('*')
    .eq('status', 'active')
  
  if (error) throw error

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ข้อมูลบุคลากร</h1>
        <p className="text-muted-foreground text-sm mt-1">
          รายชื่อและการวิเคราะห์ระดับความเสี่ยงของกำลังพลรายบุคคล
        </p>
      </div>
      <PersonnelListTable personnel={data || []} />
    </div>
  )
}
