import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThaiDate } from '@/components/shared/thai-date'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AlertsPage() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('v_active_alerts').select('*').order('created_at', { ascending: false })
  if (error) throw error

  const sevBadge = (s: string) => {
    if (s === 'emergency' || s === 'critical') return 'bg-red-100 text-red-800'
    if (s === 'warning') return 'bg-amber-100 text-amber-800'
    return 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">การแจ้งเตือน</h1><p className="text-muted-foreground text-sm mt-1">รายการทั้งหมด ({data?.length || 0})</p></div>
      <Card><CardContent className="p-0">
        <div className="divide-y">
          {data?.map((a: any) => (
            <div key={a.id} className="p-4 flex items-start gap-4 hover:bg-muted/50">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${sevBadge(a.severity)}`}>{a.severity}</span>
              <div className="flex-1">
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.message}</p>
                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                  {a.organization_name && <span>{a.organization_name}</span>}
                  {a.personnel_name && (
                    <span>
                      {a.personnel_id ? (
                        <Link href={`/personnel/${a.personnel_id}`} className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded text-foreground font-medium">
                          {a.personnel_name}
                        </Link>
                      ) : (
                        a.personnel_name
                      )}
                    </span>
                  )}
                  <span><ThaiDate date={a.created_at} format="short"/> ({a.age_hours?.toFixed(0)} ชม.)</span>
                </div>
              </div>
            </div>
          ))}
          {(!data || data.length === 0) && <p className="py-12 text-center text-muted-foreground">ไม่มีการแจ้งเตือน</p>}
        </div>
      </CardContent></Card>
    </div>
  )
}
