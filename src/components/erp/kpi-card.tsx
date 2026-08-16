import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function KpiCard({
  label,
  value,
  delta,
  trend = "up",
  hint,
  icon: Icon,
  loading,
  accent = "teal",
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  hint?: string;
  icon?: LucideIcon;
  loading?: boolean;
  accent?: "teal" | "navy" | "gold";
}) {
  if (loading) {
    return (
      <div className="card-surface p-5">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="mt-4 h-7 w-32" />
        <Skeleton className="mt-3 h-3 w-20" />
      </div>
    );
  }

  const accents = {
    teal: "bg-teal/12 text-teal",
    navy: "bg-primary/10 text-primary",
    gold: "bg-gold/20 text-gold-foreground",
  } as const;

  return (
    <div className="card-surface group relative overflow-hidden p-5 transition-shadow hover:shadow-lift">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-brand opacity-70" />
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        {Icon ? (
          <span className={cn("grid size-9 place-items-center rounded-lg", accents[accent])}>
            <Icon className="size-4.5" />
          </span>
        ) : null}
      </div>
      <p className="font-display mt-3 text-2xl font-semibold text-foreground">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium",
              trend === "up" ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive",
            )}
          >
            {trend === "up" ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {delta}
          </span>
        ) : null}
        {hint ? <span className="text-muted-foreground">{hint}</span> : null}
      </div>
    </div>
  );
}
