import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { iconMap } from "@/lib/utils/icons";
import { toneChip, toneText, type Tone } from "@/lib/utils/tone";

export function KpiCard({
  icon,
  tone = "info",
  label,
  value,
  unit,
  note,
  delta,
  dir,
}: {
  icon?: string;
  tone?: Tone;
  label: string;
  value: string;
  unit?: string;
  note?: string;
  delta?: string;
  dir?: "up" | "down";
}) {
  const Icon = icon ? iconMap[icon] : undefined;
  return (
    <Card className="flex flex-col gap-3 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug text-muted-foreground">
          {label}
        </p>
        {Icon ? (
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              toneChip[tone],
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {value}
        </span>
        {unit ? <span className="text-sm text-muted-foreground">{unit}</span> : null}
      </div>
      {delta ? (
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            dir === "down" ? "text-emerald-600" : toneText[tone],
          )}
        >
          {dir === "down" ? (
            <ArrowDownRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowUpRight className="h-3.5 w-3.5" />
          )}
          <span>{delta}</span>
        </div>
      ) : note ? (
        <p className="text-xs text-muted-foreground">{note}</p>
      ) : null}
    </Card>
  );
}
