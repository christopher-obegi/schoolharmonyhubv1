import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "gold";

const TONES: Record<string, Tone> = {
  active: "success",
  paid: "success",
  cleared: "success",
  verified: "success",
  published: "success",
  closed: "neutral",
  open: "info",
  scheduled: "info",
  invited: "info",
  pending: "warning",
  partial: "warning",
  marking: "warning",
  draft: "neutral",
  applicant: "info",
  transferred: "info",
  graduated: "gold",
  withdrawn: "danger",
  suspended: "danger",
  overdue: "danger",
  failed: "danger",
  "in arrears": "warning",
  system: "gold",
  onboarding: "warning",
  full: "warning",
  present: "success",
  late: "warning",
  absent: "danger",
  excused: "info",
  saved: "success",
  critical: "danger",
  info: "info",
  warning: "warning",
};

const toneClass: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/16 text-warning-foreground border-warning/35",
  danger: "bg-destructive/12 text-destructive border-destructive/25",
  info: "bg-info/12 text-info border-info/25",
  neutral: "bg-muted text-muted-foreground border-border",
  gold: "bg-gold/18 text-gold-foreground border-gold/40",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = TONES[status.toLowerCase()] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap",
        toneClass[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function RoleTag({ role, className }: { role: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-primary/15 bg-primary/6 px-2 py-0.5 text-xs font-medium text-primary",
        className,
      )}
    >
      {role}
    </span>
  );
}
