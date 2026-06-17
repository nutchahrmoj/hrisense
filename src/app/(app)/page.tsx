import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/shared/kpi-card";
import { SectionTitle } from "@/components/shared/headings";
import { BrandLogo } from "@/components/layout/brand-logo";
import { iconMap } from "@/lib/utils/icons";
import { cn } from "@/lib/utils/cn";
import { toneChip } from "@/lib/utils/tone";
import { landingKpis, landingFeatures, SNAPSHOT_LABEL } from "@/lib/data";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-sidebar px-6 py-10 text-white md:px-10 md:py-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 20%, color-mix(in oklch, var(--accent) 55%, transparent), transparent 42%), radial-gradient(circle at 85% 80%, color-mix(in oklch, var(--accent) 40%, transparent), transparent 45%)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col items-start gap-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/15">
            <Sparkles className="h-3.5 w-3.5" />
            ระบบสารสนเทศเพื่อการบริหารกำลังคนเชิงรุก
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <BrandLogo className="scale-110" />
          </div>
          <p className="max-w-3xl text-pretty text-base leading-relaxed text-white/85 md:text-lg">
            <span className="font-semibold text-white">HRiSENSE</span>{" "}
            (Human Resource Intelligence System for Early-risk Notification and
            Strategic Evaluation) คือระบบพยากรณ์และวิเคราะห์ความเสี่ยงด้านกำลังคน
            ที่ช่วยให้องค์กรวางแผนอัตรากำลัง การสืบทอดตำแหน่ง
            และการพัฒนาบุคลากรได้อย่างแม่นยำและทันเวลา
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              เข้าสู่ Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/executive"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/15"
            >
              รายงานสำหรับผู้บริหาร
            </Link>
          </div>
          <p className="text-xs text-white/60">ข้อมูล ณ วันที่ {SNAPSHOT_LABEL}</p>
        </div>
      </section>

      {/* KPI overview */}
      <section className="flex flex-col gap-4">
        <SectionTitle
          title="ภาพรวมกำลังคน"
          description="สรุปตัวชี้วัดสำคัญด้านอัตรากำลังขององค์กร"
          icon="barChart"
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {landingKpis.map((kpi) => (
            <KpiCard key={kpi.key} {...kpi} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="flex flex-col gap-4">
        <SectionTitle
          title="ความสามารถหลักของระบบ"
          description="เครื่องมือสนับสนุนการตัดสินใจด้านทรัพยากรบุคคล"
          icon="scanSearch"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {landingFeatures.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <Card
                key={feature.title}
                className="flex items-start gap-4 p-5 transition-shadow hover:shadow-md"
              >
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                    toneChip[feature.tone],
                  )}
                >
                  {Icon ? <Icon className="h-6 w-6" /> : null}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
