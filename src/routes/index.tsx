import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useRole } from "@/components/erp/role-context";
import { useMemo, type ReactNode } from "react";
import { ArrowUpRight, Banknote, CalendarCheck, GraduationCap, Wallet } from "lucide-react";
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
import { displayName, useAuth } from "@/lib/auth";
import {
  attendanceTrend,
  compactMoney,
  feeTotals,
  meanBy,
  monthlyFinance,
  statusMix,
} from "@/lib/analytics";
import {
  dateTime,
  humanize,
  money,
  pageHead,
  shortDate,
  useList,
  useLookup,
} from "@/lib/resources";

export const Route = createFileRoute("/")({
  head: pageHead(
    "Dashboard",
    "Live overview of enrollment, attendance, examinations and fee collection.",
  ),
  component: Dashboard,
});

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};

/** Body for a card whose data could not be loaded (usually a role without access). */
function Unavailable({
  error,
  empty,
  children,
}: {
  error: unknown;
  empty: boolean;
  children: ReactNode;
}) {
  if (error) {
    return (
      <p className="px-5 py-10 text-center text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "Not available"}
      </p>
    );
  }
  if (empty) {
    return <p className="px-5 py-10 text-center text-sm text-muted-foreground">No data yet.</p>;
  }
  return <>{children}</>;
}

/** Parents and students land on their portal; staff get the school dashboard. */
function Dashboard() {
  const { portalOnly } = useRole();
  return portalOnly ? <Navigate to="/me" /> : <StaffDashboard />;
}

function StaffDashboard() {
  const { user } = useAuth();
  const canAudit = useRole().can("audit_logs");
  const students = useList("students");
  const sessions = useList("attendanceSessions");
  const invoices = useList("invoices");
  const payments = useList("payments");
  const results = useList("results");
  const exams = useList("exams");
  const auditLogs = useList("auditLogs");
  const studentNames = useLookup("students");
  const classes = useLookup("classes");
  const schools = useLookup("schools");
  const years = useLookup("academicYears");
  const terms = useLookup("terms");

  const finance = useMemo(
    () => feeTotals(invoices.data ?? [], payments.data ?? []),
    [invoices.data, payments.data],
  );
  const monthly = useMemo(
    () => monthlyFinance(invoices.data ?? [], payments.data ?? []),
    [invoices.data, payments.data],
  );
  const mix = useMemo(() => statusMix(students.data ?? []), [students.data]);
  const trend = useMemo(() => attendanceTrend(sessions.data ?? [], 7), [sessions.data]);
  const classMeans = useMemo(
    () => meanBy(results.data ?? [], exams.data ?? [], (exam) => classes.name(exam.class_name)),
    [results.data, exams.data, classes],
  );

  const latestAttendance = trend.at(-1);
  const activeStudents = (students.data ?? []).filter((s) => s.status === "ACTIVE").length;
  const currentYear = years.rows.find((y) => y.is_current);
  const currentTerm = terms.rows.find((t) => t.is_current);

  const attention = useMemo(
    () =>
      (invoices.data ?? [])
        .filter((i) => Number(i.balance) > 0 && i.status !== "CANCELLED")
        .sort((a, b) => {
          const rank = (s: unknown) => (s === "OVERDUE" ? 0 : s === "PARTIALLY_PAID" ? 1 : 2);
          return rank(a.status) - rank(b.status) || Number(b.balance) - Number(a.balance);
        })
        .slice(0, 6),
    [invoices.data],
  );

  const context = [
    currentTerm ? String(currentTerm.name) : null,
    currentYear ? `Academic year ${currentYear.name}` : null,
    schools.rows.length
      ? `${schools.rows.length} school${schools.rows.length === 1 ? "" : "s"}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user ? displayName(user).split(" ")[0] : ""}`}
        description={context || "Overview of students, attendance, exams and fees."}
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
        <KpiCard
          label="Total students"
          value={students.error ? "—" : (students.data?.length ?? 0).toLocaleString()}
          hint={students.error ? "No access" : `${activeStudents.toLocaleString()} active`}
          icon={GraduationCap}
          loading={students.isLoading}
          accent="navy"
        />
        <KpiCard
          label="Attendance (latest day)"
          value={latestAttendance ? `${latestAttendance.rate}%` : "—"}
          hint={
            sessions.error
              ? "No access"
              : latestAttendance
                ? `${latestAttendance.total} marked · ${latestAttendance.day}`
                : "Nothing marked yet"
          }
          icon={CalendarCheck}
          loading={sessions.isLoading}
          accent="teal"
        />
        <KpiCard
          label="Fees collected"
          value={payments.error ? "—" : compactMoney(finance.collected)}
          hint={payments.error ? "No access" : `of ${compactMoney(finance.invoiced)} invoiced`}
          icon={Banknote}
          loading={payments.isLoading || invoices.isLoading}
          accent="gold"
        />
        <KpiCard
          label="Outstanding balance"
          value={invoices.error ? "—" : compactMoney(finance.outstanding)}
          hint={
            invoices.error ? "No access" : `${finance.accountsInArrears} students with a balance`
          }
          icon={Wallet}
          loading={invoices.isLoading}
          accent="navy"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Fee collection vs invoicing"
          description={`KES by month, ${new Date().getFullYear()}`}
        >
          <div className="p-4">
            <Unavailable
              error={invoices.error ?? payments.error}
              empty={!monthly.some((m) => m.invoiced || m.collected)}
            >
              <CollectionsAreaChart data={monthly} />
            </Unavailable>
          </div>
        </SectionCard>

        <SectionCard title="Enrollment mix" description="Students by lifecycle status">
          <div className="p-4">
            <Unavailable error={students.error} empty={!mix.length}>
              <MixDonutChart data={mix} />
              <ul className="mt-2 space-y-1.5">
                {mix.map((item) => (
                  <li key={item.name} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">{item.value.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </Unavailable>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Attendance rate" description="Last 7 days with attendance marked">
          <div className="p-4">
            <Unavailable error={sessions.error} empty={!trend.length}>
              <TrendLineChart
                data={trend.map(({ day, rate }) => ({ day, rate }))}
                xKey="day"
                yKey="rate"
              />
            </Unavailable>
          </div>
        </SectionCard>

        <SectionCard title="Mean score by class" description="All results recorded">
          <div className="p-4">
            <Unavailable error={results.error} empty={!classMeans.length}>
              <ComparisonBarChart
                data={classMeans}
                xKey="name"
                bars={[{ key: "mean", color: "var(--color-chart-1)" }]}
              />
            </Unavailable>
          </div>
        </SectionCard>

        <SectionCard title="Activity feed" description="Latest audited actions">
          {canAudit ? (
            <Unavailable
              error={auditLogs.error}
              empty={!auditLogs.isLoading && !auditLogs.data?.length}
            >
              <ul className="divide-y divide-border">
                {(auditLogs.data ?? []).slice(0, 6).map((entry) => (
                  <li key={entry.id} className="px-5 py-3">
                    <p className="text-sm">
                      <span className="font-medium">{String(entry.user ?? "System")}</span>{" "}
                      <span className="text-muted-foreground">
                        {String(
                          entry.description || `${humanize(entry.action)} ${entry.model_name}`,
                        )}
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {String(entry.model_name)} · {dateTime(entry.timestamp)}
                    </p>
                  </li>
                ))}
              </ul>
            </Unavailable>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              The audit trail is visible to school admins only.
            </p>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Invoices needing attention"
        description="Overdue and partially paid balances first"
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/finance/invoices">View all invoices</Link>
          </Button>
        }
      >
        <Unavailable error={invoices.error} empty={!invoices.isLoading && !attention.length}>
          <ul className="divide-y divide-border">
            {attention.map((invoice) => {
              const total = Math.max(1, Number(invoice.total_amount));
              const paidShare = 100 - (Number(invoice.balance) / total) * 100;
              return (
                <li
                  key={invoice.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{studentNames.name(invoice.student)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {String(invoice.invoice_number || `#${invoice.id}`)} · due{" "}
                      {shortDate(invoice.due_date)}
                    </p>
                  </div>
                  <div className="w-40">
                    <Progress value={Math.max(0, Math.min(100, paidShare))} />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {money(invoice.balance)} outstanding
                    </p>
                  </div>
                  <StatusBadge status={humanize(invoice.status)} />
                </li>
              );
            })}
          </ul>
        </Unavailable>
      </SectionCard>
    </>
  );
}
