import { cn } from "@/lib/utils/cn";
import { iconMap } from "@/lib/utils/icons";
import { toneChip, type Tone } from "@/lib/utils/tone";

export function PageTitle({
  icon,
  tone = "info",
  title,
  description,
  actions,
  className,
}: {
  icon?: string;
  tone?: Tone;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  const Icon = icon ? iconMap[icon] : undefined;
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {Icon ? (
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              toneChip[tone],
            )}
          >
            <Icon className="h-6 w-6" />
          </span>
        ) : null}
        <div>
          <h1 className="text-balance text-xl font-bold text-foreground md:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-pretty text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function SectionTitle({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description?: string;
  icon?: string;
  className?: string;
}) {
  const Icon = icon ? iconMap[icon] : undefined;
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {Icon ? <Icon className="h-5 w-5 text-accent" /> : null}
      <div>
        <h2 className="text-base font-semibold text-foreground md:text-lg">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
