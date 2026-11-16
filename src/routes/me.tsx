import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/erp/page-header";
import { DataTable, type Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { KpiCard } from "@/components/erp/kpi-card";
import { ComparisonBarChart } from "@/components/erp/charts";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/components/erp/role-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { humanize, money, pageHead, shortDate, useList, useLookup } from "@/lib/resources";

const DESCRIPTION = "Your results, attendance and fee position.";

export const Route = createFileRoute("/me")({
  head: pageHead("My portal", DESCRIPTION),
  component: Page,
});

type ResultRow = {
  id: number;
  exam: string;
  subject: string;
  score: string;
  percentage: number;
  grade: string;
  rank: string;
};
type InvoiceRow = {
  id: number;
  number: string;
  due: string;
  amount: string;
  balance: string;
  status: string;
};

const resultColumns: Column<ResultRow>[] = [
  { key: "exam", header: "Exam", sortable: true },
  { key: "subject", header: "Subject", sortable: true },
  { key: "score", header: "Score", align: "right" },
  { key: "percentage", header: "%", align: "right", sortable: true },
  { key: "grade", header: "Grade", align: "right" },
  { key: "rank", header: "Position", align: "right" },
];

const invoiceColumns: Column<InvoiceRow>[] = [
  { key: "number", header: "Invoice", sortable: true },
  { key: "due", header: "Due" },
  { key: "amount", header: "Amount", align: "right" },
  { key: "balance", header: "Balance", align: "right" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function Page() {
  const { user } = useAuth();
  const students = useList("students");
  const results = useList("results");
  const exams = useList("exams");
  const summaries = useList("attendanceSummaries");
  const invoices = useList("invoices");
  const subjects = useLookup("subjects");
  const classes = useLookup("classes");

  /** The student record linked to this login, if any. */
  const { portalOnly } = useRole();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /**
   * Students this login may follow. For parents/students the API already limits
   * GET /api/students/ to their own children/themselves; staff see only a record
   * linked to their own login.
   */
  const mine = useMemo(
    () => (students.data ?? []).filter((s) => portalOnly || Number(s.user) === user?.id),
    [students.data, portalOnly, user?.id],
  );
  const me = mine.find((s) => String(s.id) === selectedId) ?? mine[0];

  const examById = useMemo(() => new Map((exams.data ?? []).map((e) => [e.id, e])), [exams.data]);

  const myResults = useMemo<ResultRow[]>(
    () =>
      (results.data ?? [])
        .filter((r) => me && Number(r.student) === me.id)
        .map((r) => {
          const exam = examById.get(Number(r.exam));
          return {
            id: r.id,
            exam: String(exam?.name ?? `#${r.exam}`),
            subject: subjects.name(exam?.subject),
            score: `${Number(r.marks_obtained)} / ${Number(r.total_marks)}`,
            percentage: Number(r.percentage),
            grade: String(r.grade || "—"),
            rank: Number(r.rank) ? String(r.rank) : "—",
          };
        }),
    [results.data, me, examById, subjects],
  );

  const myInvoices = useMemo<InvoiceRow[]>(
    () =>
      (invoices.data ?? [])
        .filter((i) => me && Number(i.student) === me.id)
        .map((i) => ({
          id: i.id,
          number: String(i.invoice_number || `#${i.id}`),
          due: shortDate(i.due_date),
          amount: money(i.total_amount),
          balance: money(i.balance),
          status: humanize(i.status),
        })),
    [invoices.data, me],
  );

  const attendance = useMemo(
    () => (summaries.data ?? []).filter((s) => me && Number(s.student) === me.id).at(-1),
    [summaries.data, me],
  );

  const mean = myResults.length
    ? myResults.reduce((t, r) => t + r.percentage, 0) / myResults.length
    : null;
  const balance = (invoices.data ?? [])
    .filter((i) => me && Number(i.student) === me.id)
    .reduce((t, i) => t + Number(i.balance), 0);

  if (students.isLoading) {
    return <PageHeader title="My portal" description={DESCRIPTION} />;
  }

  if (!me) {
    return (
      <>
        <PageHeader title="My portal" description={DESCRIPTION} />
        <SectionCard title="No student record linked">
          <div className="flex items-start gap-3 p-6 text-sm text-muted-foreground">
            <UserRound className="mt-0.5 size-4 shrink-0" />
            <p>
              The portal shows data for the student linked to your login. An administrator links a
              student to a user account through the student record's{" "}
              <code className="font-mono">user</code> field.
            </p>
          </div>
        </SectionCard>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="My portal"
        description={`${me.full_name} · ${me.admission_number} · ${classes.name(me.current_class)}`}
        actions={
          mine.length > 1 ? (
            <Select value={String(me.id)} onValueChange={setSelectedId}>
              <SelectTrigger className="w-56" aria-label="Choose a child">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mine.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {String(s.full_name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Mean score"
          value={mean == null ? "—" : `${mean.toFixed(1)}%`}
          hint={`${myResults.length} results`}
        />
        <KpiCard
          label="Status"
          value={humanize(me.status)}
          hint={`Admitted ${shortDate(me.admission_date)}`}
          accent="navy"
        />
        <KpiCard
          label="Attendance"
          value={attendance ? `${Number(attendance.attendance_percentage).toFixed(1)}%` : "—"}
          hint={attendance ? `${attendance.present_days} days present` : "No summary yet"}
          accent="teal"
        />
        <KpiCard
          label="Fee balance"
          value={invoices.error ? "—" : money(balance)}
          hint={
            invoices.error
              ? "Ask the finance office"
              : balance > 0
                ? "outstanding"
                : "fully settled"
          }
          accent="gold"
        />
      </div>

      <SectionCard title="Results by subject" description="Percentage per exam">
        <div className="p-4">
          {myResults.length ? (
            <ComparisonBarChart
              data={myResults.map((r) => ({ subject: r.subject, score: r.percentage }))}
              xKey="subject"
              bars={[{ key: "score", color: "var(--color-chart-1)" }]}
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No results published yet.
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="My results" description="Scores across the assessment cycle">
        <DataTable<ResultRow>
          columns={resultColumns}
          rows={myResults}
          loading={results.isLoading}
          searchKeys={["exam", "subject"]}
          searchPlaceholder="Search results…"
        />
      </SectionCard>

      {invoices.error ? null : (
        <SectionCard title="My invoices" description="Fees billed to my account">
          <DataTable<InvoiceRow>
            columns={invoiceColumns}
            rows={myInvoices}
            loading={invoices.isLoading}
            searchKeys={["number"]}
            searchPlaceholder="Search invoices…"
          />
        </SectionCard>
      )}
    </>
  );
}
