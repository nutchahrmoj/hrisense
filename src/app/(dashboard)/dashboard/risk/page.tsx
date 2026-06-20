import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RiskBadge } from '@/components/personnel/risk-badge'
import { ThaiDate } from '@/components/shared/thai-date'
import { FilterBar } from '@/components/filters/filter-bar'
import { RiskDistributionChart } from '@/components/charts/risk-distribution-chart'
import {
  AlertTriangle, TrendingUp, Shield, Target,
  Users, Activity, Filter, Download,
  ChevronRight, BarChart3, PieChart, LineChart
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function RiskPage() {
  const supabase = await createServerSupabaseClient()

  const [orgData, highRiskData, riskDistribution, orgRiskDetails] = await Promise.all([
    supabase.from('v_org_dashboard').select('*'),
    supabase.from('v_high_risk_personnel').select('*').order('overall_risk_score', { ascending: false }).limit(30),
    supabase.from('v_risk_distribution').select('*'),
    supabase.from('v_org_risk_details').select('*').limit(20),
  ])

  const orgs = orgData.data || []
  const highRiskPersonnel = highRiskData.data || []
  const riskDist = riskDistribution.data || []
  const orgDetails = orgRiskDetails.data || []

  // Statistics
  const avgScore = orgs.length > 0 ? orgs.reduce((s:number,o:any)=>s+(o.overall_risk_score||0),0)/orgs.length : 0
  const criticalOrgs = orgs.filter((o:any)=>o.risk_level==='critical').length
  const redOrgs = orgs.filter((o:any)=>o.risk_level==='red').length
  const amberOrgs = orgs.filter((o:any)=>o.risk_level==='amber').length
  const greenOrgs = orgs.filter((o:any)=>o.risk_level==='green').length
  const totalHighRisk = highRiskPersonnel.length

  // Risk type distribution
  const retirementRisk = riskDist.find(r => r.risk_type === 'retirement')?.count || 0
  const transferRisk = riskDist.find(r => r.risk_type === 'transfer')?.count || 0
  const talentLossRisk = riskDist.find(r => r.risk_type === 'talent_loss')?.count || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">วิเคราะห์ความเสี่ยง</h1>
          <p className="text-muted-foreground text-sm mt-1">ภาพรวมความเสี่ยงด้านกำลังคนและการประเมินเชิงลึก</p>
        </div>
        <div className="flex gap-2">
          <FilterBar
            filters={[
              {
                id: 'risk_level',
                label: 'ระดับความเสี่ยง',
                type: 'multiselect',
                paramKey: 'risk',
                options: [
                  { value: 'critical', label: 'วิกฤต' },
                  { value: 'red', label: 'เสี่ยงสูง' },
                  { value: 'amber', label: 'เฝ้าระวัง' },
                  { value: 'green', label: 'ปกติ' },
                ],
              },
              {
                id: 'organization',
                label: 'หน่วยงาน',
                type: 'select',
                paramKey: 'org',
                options: [
                  { value: '', label: 'ทั้งหมด' },
                  ...orgs.map((o: any) => ({ value: o.organization_id, label: o.name_th })),
                ],
              },
              {
                id: 'search',
                label: 'ค้นหา',
                type: 'search',
                paramKey: 'q',
                placeholder: 'ชื่อ, ตำแหน่ง...',
              },
            ]}
          />
          <Badge variant="outline" className="text-xs">
            <Download className="w-3 h-3 mr-1" />
            ส่งออก
          </Badge>
        </div>
      </div>

      {/* KPI Cards - Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">เฉลี่ย</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{avgScore.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-1">คะแนนเสี่ยงเฉลี่ย</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="text-xs text-muted-foreground">วิกฤต</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{criticalOrgs}</p>
            <p className="text-xs text-muted-foreground mt-1">หน่วยงานวิกฤต</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-5 h-5 rounded-full bg-red-500" />
              <span className="text-xs text-muted-foreground">เสี่ยงสูง</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{redOrgs}</p>
            <p className="text-xs text-muted-foreground mt-1">หน่วยงาน</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-5 h-5 rounded-full bg-amber-500" />
              <span className="text-xs text-muted-foreground">เฝ้าระวัง</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{amberOrgs}</p>
            <p className="text-xs text-muted-foreground mt-1">หน่วยงาน</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-5 h-5 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">ปกติ</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{greenOrgs}</p>
            <p className="text-xs text-muted-foreground mt-1">หน่วยงาน</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Level Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              การกระจายความเสี่ยงตามหน่วยงาน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RiskDistributionChart
              data={[
                { name: 'วิกฤต', value: criticalOrgs, color: '#dc2626' },
                { name: 'เสี่ยงสูง', value: redOrgs, color: '#ef4444' },
                { name: 'เฝ้าระวัง', value: amberOrgs, color: '#f59e0b' },
                { name: 'ปกติ', value: greenOrgs, color: '#22c55e' },
              ]}
            />
          </CardContent>
        </Card>

        {/* Risk Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              ประเภทความเสี่ยง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg border bg-card">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">{retirementRisk}</p>
                <p className="text-xs text-muted-foreground mt-1">เสี่ยงเกษียณ</p>
              </div>
              <div className="text-center p-4 rounded-lg border bg-card">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-amber-600">{transferRisk}</p>
                <p className="text-xs text-muted-foreground mt-1">เสี่ยงโอนย้าย</p>
              </div>
              <div className="text-center p-4 rounded-lg border bg-card">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{talentLossRisk}</p>
                <p className="text-xs text-muted-foreground mt-1">เสี่ยงสูญเสียทาเลนท์</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              บุคลากรที่มีความเสี่ยงแต่ละประเภท
            </p>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Personnel - Detailed Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              บุคลากรเสี่ยงสูง (เรียงตามคะแนน)
            </CardTitle>
            <Badge variant="destructive" className="text-xs">
              {totalHighRisk} คน
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="บุคลากรเสี่ยงสูง">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">อันดับ</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">ชื่อ-นามสกุล</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">หน่วยงาน</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">ตำแหน่ง</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">ระดับเสี่ยง</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">สาเหตุหลัก</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground" scope="col">คะแนน</th>
                </tr>
              </thead>
              <tbody>
                {highRiskPersonnel.map((p, idx) => (
                  <tr key={p.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={cn(
                        'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                        idx < 3 ? 'bg-destructive text-white' : 'bg-muted text-muted-foreground'
                      )}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      <Link href={`/personnel/${p.id}`} className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded text-foreground">
                        {p.full_name_th}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{p.organization_name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{p.position_name || '—'}</td>
                    <td className="py-3 px-4">
                      <RiskBadge level={p.risk_level} score={p.overall_risk_score} />
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{p.primary_risk_driver || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={cn(
                        'font-bold font-mono',
                        p.overall_risk_score > 80 && 'text-destructive',
                        p.overall_risk_score > 60 && p.overall_risk_score <= 80 && 'text-red-600',
                        p.overall_risk_score >= 25 && p.overall_risk_score < 50 && 'text-amber-600',
                        p.overall_risk_score < 25 && 'text-green-600'
                      )}>
                        {p.overall_risk_score?.toFixed(0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {highRiskPersonnel.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
              <p>ไม่พบบุคลากรเสี่ยงสูง</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Risk Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-primary" />
            รายละเอียดความเสี่ยงรายหน่วยงาน
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="รายละเอียดความเสี่ยงรายหน่วยงาน">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground" scope="col">หน่วยงาน</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground" scope="col">จำนวนคน</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground" scope="col">เกษียณ</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground" scope="col">โอนย้าย</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground" scope="col">ทาเลนท์</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground" scope="col">อัตราว่าง</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground" scope="col">คะแนนรวม</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground" scope="col">ระดับ</th>
                </tr>
              </thead>
              <tbody>
                {orgDetails.map((o, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{o.organization_name}</td>
                    <td className="py-3 px-4 text-center">{o.total_personnel || 0}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        'inline-block px-2 py-1 rounded text-xs font-medium',
                        (o.retirement_risk || 0) >= 75 ? 'bg-red-100 text-red-800' :
                        (o.retirement_risk || 0) >= 50 ? 'bg-orange-100 text-orange-800' :
                        (o.retirement_risk || 0) >= 25 ? 'bg-amber-100 text-amber-800' :
                        'bg-green-100 text-green-800'
                      )}>
                        {o.retirement_risk?.toFixed(0) || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        'inline-block px-2 py-1 rounded text-xs font-medium',
                        (o.transfer_risk || 0) >= 75 ? 'bg-red-100 text-red-800' :
                        (o.transfer_risk || 0) >= 50 ? 'bg-orange-100 text-orange-800' :
                        (o.transfer_risk || 0) >= 25 ? 'bg-amber-100 text-amber-800' :
                        'bg-green-100 text-green-800'
                      )}>
                        {o.transfer_risk?.toFixed(0) || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        'inline-block px-2 py-1 rounded text-xs font-medium',
                        (o.talent_loss_risk || 0) >= 75 ? 'bg-red-100 text-red-800' :
                        (o.talent_loss_risk || 0) >= 50 ? 'bg-orange-100 text-orange-800' :
                        (o.talent_loss_risk || 0) >= 25 ? 'bg-amber-100 text-amber-800' :
                        'bg-green-100 text-green-800'
                      )}>
                        {o.talent_loss_risk?.toFixed(0) || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        'inline-block px-2 py-1 rounded text-xs font-medium',
                        (o.vacancy_rate || 0) >= 15 ? 'bg-red-100 text-red-800' :
                        (o.vacancy_rate || 0) >= 10 ? 'bg-amber-100 text-amber-800' :
                        'bg-green-100 text-green-800'
                      )}>
                        {o.vacancy_rate?.toFixed(1) || '—'}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        'font-bold font-mono',
                        (o.overall_risk_score || 0) >= 75 && 'text-destructive',
                        (o.overall_risk_score || 0) >= 50 && (o.overall_risk_score || 0) < 75 && 'text-red-600',
                        (o.overall_risk_score || 0) >= 25 && (o.overall_risk_score || 0) < 50 && 'text-amber-600',
                        (o.overall_risk_score || 0) < 25 && 'text-green-600'
                      )}>
                        {o.overall_risk_score?.toFixed(0) || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={o.risk_level === 'critical' ? 'destructive' :
                                  o.risk_level === 'red' ? 'destructive' :
                                  o.risk_level === 'amber' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {o.risk_level === 'critical' ? 'วิกฤต' :
                         o.risk_level === 'red' ? 'เสี่ยงสูง' :
                         o.risk_level === 'amber' ? 'เฝ้าระวัง' : 'ปกติ'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orgDetails.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>ไม่มีข้อมูลความเสี่ยงรายหน่วยงาน</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Assessment Methodology */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            เกณฑ์การประเมินความเสี่ยง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { level: 'วิกฤต', score: '75-100', color: 'bg-destructive', description: 'ต้องดูแลเร่งด่วนภายใน 30 วัน' },
              { level: 'เสี่ยงสูง', score: '50-74', color: 'bg-red-500', description: 'ต้องติดตามและแก้ไขภายใน 90 วัน' },
              { level: 'เฝ้าระวัง', score: '25-49', color: 'bg-amber-500', description: 'ควรติดตามเป็นระยะ' },
              { level: 'ปกติ', score: '0-24', color: 'bg-green-500', description: 'ไม่มีความเสี่ยงสำคัญ' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-4 h-4 rounded-full ${item.color}`} />
                  <span className="font-semibold">{item.level}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">คะแนน: {item.score}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
