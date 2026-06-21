import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RiskBadge } from '@/components/personnel/risk-badge'
import { Users, BarChart3, CalendarClock, Building2 } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OrganizationsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: orgs, error } = await supabase
    .from('v_org_dashboard')
    .select('*')
    .order('name_th')
  if (error) throw error

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">หน่วยงาน</h1>
        <p className="text-muted-foreground text-sm mt-1">
          ภาพรวมหน่วยงานในสังกัด ({orgs?.length || 0} หน่วยงาน)
        </p>
      </div>

      {!orgs?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">ไม่พบข้อมูลหน่วยงาน</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orgs.map((org: any) => (
            <Link
              key={org.organization_id}
              href={`/organizations/${org.organization_id}`}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base leading-snug truncate">
                        {org.abbreviation_th || org.name_th}
                      </CardTitle>
                      {org.abbreviation_th && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {org.name_th}
                        </p>
                      )}
                    </div>
                    <RiskBadge level={org.risk_level} score={org.overall_risk_score} />
                  </div>
                  <p className="text-xs text-muted-foreground">{org.org_code}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="font-medium">{org.total_personnel}</p>
                        <p className="text-xs text-muted-foreground">บุคลากร</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="font-medium">{org.total_quota}</p>
                        <p className="text-xs text-muted-foreground">อัตรากำลัง</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarClock className="w-3.5 h-3.5" />
                      <span className="text-xs">เกษียณ 1 ปี: {org.retirements_1yr}</span>
                    </div>
                    {org.vacancy_count > 0 && (
                      <span className="text-xs text-amber-600 font-medium">
                        ว่าง {org.vacancy_count} อัตรา
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
