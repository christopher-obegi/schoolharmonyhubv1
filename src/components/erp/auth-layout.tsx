import type { ReactNode } from "react";
import { GraduationCap, ShieldCheck, Sparkles, Users } from "lucide-react";

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="bg-gradient-brand relative hidden flex-col justify-between p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-primary-foreground/15">
            <GraduationCap className="size-5 text-primary-foreground" />
          </span>
          <p className="font-display text-lg font-semibold text-primary-foreground">
            Scholaris ERP
          </p>
        </div>

        <div className="max-w-md">
          <h2 className="font-display text-3xl leading-tight font-semibold text-primary-foreground">
            One platform for every school you run.
          </h2>
          <p className="mt-3 text-sm text-primary-foreground/75">
            Admissions, academics, attendance, examinations and finance — governed by
            role-based access and a full audit trail.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-primary-foreground/85">
            {[
              { icon: Users, text: "4,812 students across 4 campuses" },
              { icon: ShieldCheck, text: "Granular permissions and audit logging" },
              { icon: Sparkles, text: "Automated invoicing and M-Pesa reconciliation" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3">
                <item.icon className="size-4 text-gold" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-primary-foreground/60">© 2026 Scholaris · Demo environment</p>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="bg-gradient-brand grid size-10 place-items-center rounded-xl">
              <GraduationCap className="size-5 text-primary-foreground" />
            </span>
          </div>
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          <div className="mt-7">{children}</div>
          {footer ? <div className="mt-6 text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
