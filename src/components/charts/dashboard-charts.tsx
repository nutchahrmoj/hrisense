"use client";

import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  retirementTrend,
  ageGroups,
  workforceByLine,
  movementTrend,
} from "@/lib/data";

const axisStyle = { fontSize: 12, fill: "var(--muted-foreground)" };
const gridColor = "color-mix(in oklch, var(--muted-foreground) 14%, transparent)";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label ? <p className="mb-1 font-semibold text-foreground">{label}</p> : null}
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: p.color || p.payload?.color }}
          />
          {p.name}: <span className="font-medium text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function RetirementTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={retirementTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <XAxis dataKey="year" tickLine={false} axisLine={false} tick={axisStyle} />
        <YAxis tickLine={false} axisLine={false} tick={axisStyle} />
        <Tooltip cursor={{ fill: gridColor }} content={<ChartTooltip />} />
        <Bar dataKey="count" name="จำนวนผู้เกษียณ" radius={[6, 6, 0, 0]} fill="var(--accent)" maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AgeDonutChart() {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={220} className="max-w-[220px]">
        <PieChart>
          <Pie
            data={ageGroups}
            dataKey="value"
            nameKey="name"
            innerRadius={56}
            outerRadius={88}
            paddingAngle={2}
            stroke="none"
          >
            {ageGroups.map((g) => (
              <Cell key={g.name} fill={g.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex w-full flex-col gap-2">
        {ageGroups.map((g) => (
          <li key={g.name} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: g.color }} />
              {g.name}
            </span>
            <span className="font-medium text-foreground">
              {g.value}% <span className="text-muted-foreground">({g.count})</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WorkforceLineChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        layout="vertical"
        data={workforceByLine}
        margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
      >
        <XAxis type="number" tickLine={false} axisLine={false} tick={axisStyle} />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={120}
          tick={axisStyle}
        />
        <Tooltip cursor={{ fill: gridColor }} content={<ChartTooltip />} />
        <Bar dataKey="count" name="จำนวน (คน)" radius={[0, 6, 6, 0]} fill="#22b8cf" maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MovementChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={movementTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <XAxis dataKey="year" tickLine={false} axisLine={false} tick={axisStyle} />
        <YAxis tickLine={false} axisLine={false} tick={axisStyle} />
        <Tooltip content={<ChartTooltip />} />
        <Line type="monotone" dataKey="transfer" name="โอน/ย้าย" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="resign" name="ลาออก" stroke="#e8590c" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
