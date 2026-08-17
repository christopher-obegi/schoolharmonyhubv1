import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Banknote,
  CalendarCheck,
  GraduationCap,
  Wallet,
} from "lucide-react";
import { PageHeader, SectionCard } from "@/components/erp/page-header";
import { KpiCard } from "@/components/erp/kpi-card";
import { StatusBadge } from "@/components/erp/status-badge";
import {
  CollectionsAreaChart,
  ComparisonBarChart,
  MixDonutChart,
  TrendLineChart,
} from "@/components/erp/charts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  activityFeed,
  attendanceSeries,
  classPerformance,
  dashboardKpis,
  enrollmentMix,
  invoices,
  revenueSeries,
} from "@/lib/erp-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Scholaris ERP" },
      {
        name: "description",
        content:
          "Live overview of enrollment, attendance, examinations and fee collection across all schools.",
      },
      { property: "og:title", content: "Dashboard — Scholaris ERP" },
      {
        property: "og:description",
        content: "Live overview of enrollment, attendance, exams and fee collection.",
      },
    ],
  }),
  component: Dashboard,
});

const ICONS = [GraduationCap, CalendarCheck, Banknote, Wallet];

function Dashboard() {
  return (
    <>
      <PageHeader
        title="Good morning, Amina"
        description="Term 2 · Academic year 2026 · 4 schools · Data refreshed 6 minutes ago."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/reports">Open reports</Link>
            </Button>
            <Button asChild>
              <Link to="/students">
                Student directory <ArrowUpRight className="ml-1 size-4" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardKpis.map((kpi, i) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            trend={kpi.trend}
            hint={kpi.hint}
            icon={ICONS[i]}
            accent={i % 3 === 0 ? "navy" : i % 3 === 1 ? "teal" : "gold"}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Fee collection vs invoicing"
          description="Millions KES, current academic year"
        >
          <div className="p-4">
            <CollectionsAreaChart data={revenueSeries} />
          </div>
        </SectionCard>

        <SectionCard title="Enrollment mix" description="Students by lifecycle status">
          <div className="p-4">
            <MixDonutChart data={enrollmentMix} />
            <ul className="mt-2 space-y-1.5">
              {enrollmentMix.map((item) => (
                <li key={item.name} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium">{item.value.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Attendance rate" description="This week, all schools">
          <div className="p-4">
            <TrendLineChart data={attendanceSeries} xKey="day" yKey="rate" />
          </div>
        </SectionCard>

        <SectionCard title="Mean score by class" description="Term 2 end-term exams">
          <div className="p-4">
            <ComparisonBarChart
              data={classPerformance}
              xKey="name"
              bars={[{ key: "mean", color: "var(--color-chart-1)" }]}
            />
          </div>
        </SectionCard>

        <SectionCard title="Activity feed" description="Latest actions across modules">
          <ul className="divide-y divide-border">
            {activityFeed.map((entry) => (
              <li key={`${entry.actor}-${entry.at}`} className="px-5 py-3">
                <p className="text-sm">
                  <span className="font-medium">{entry.actor}</span>{" "}
                  <span className="text-muted-foreground">{entry.action}</span>
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {entry.module} · {entry.at}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        title="Invoices needing attention"
        description="Partial and overdue balances first"
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/finance/invoices">View all invoices</Link>
          </Button>
        }
      >
        <ul className="divide-y divide-border">
          {invoices
            .filter((invoice) => invoice.status !== "paid")
            .map((invoice) => (
              <li
                key={invoice.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{invoice.student}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {invoice.id} · {invoice.class} · due {invoice.due}
                  </p>
                </div>
                <div className="w-40">
                  <Progress
                    value={
                      100 -
                      (Number(invoice.balance.replace(/\D/g, "")) /
                        Math.max(1, Number(invoice.amount.replace(/\D/g, "")))) *
                        100
                    }
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {invoice.balance} outstanding
                  </p>
                </div>
                <StatusBadge status={invoice.status} />
              </li>
            ))}
        </ul>
      </SectionCard>
    </>
  );
}
