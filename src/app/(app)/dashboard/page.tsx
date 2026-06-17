import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/shared/kpi-card";
import { PageTitle } from "@/components/shared/headings";
import {
  RetirementTrendChart,
  AgeDonutChart,
  WorkforceLineChart,
  MovementChart,
} from "@/components/charts/dashboard-charts";
import { landingKpis, SNAPSHOT_SHORT } from "@/lib/data";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        icon="barChart"
        tone="info"
        title="Dashboard ภาพรวมกำลังคน"
        description={`สรุปสถานะอัตรากำลังและแนวโน้มสำคัญ • ข้อมูล ณ ${SNAPSHOT_SHORT}`}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {landingKpis.map((kpi) => (
          <KpiCard key={kpi.key} {...kpi} />
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>แนวโน้มการเกษียณอายุราชการ (รายปี)</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              จำนวนผู้เกษียณที่คาดการณ์ในอีก 5 ปีข้างหน้า (คน)
            </p>
          </CardHeader>
          <CardContent>
            <RetirementTrendChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>โครงสร้างอายุของบุคลากร</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              สัดส่วนบุคลากรจำแนกตามช่วงอายุ
            </p>
          </CardHeader>
          <CardContent>
            <AgeDonutChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>กำลังคนจำแนกตามประเภทตำแหน่ง</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              จำนวนบุคลากรในแต่ละสายงาน
            </p>
          </CardHeader>
          <CardContent>
            <WorkforceLineChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>แนวโน้มการเคลื่อนย้ายบุคลากร</CardTitle>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" /> โอน/ย้าย
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#e8590c" }} />{" "}
                ลาออก
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <MovementChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
