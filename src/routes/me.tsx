import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/erp/page-header";
import { DataTable, type Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { KpiCard } from "@/components/erp/kpi-card";
import { ComparisonBarChart } from "@/components/erp/charts";
import { myGrades, myPayments, myTimetable } from "@/lib/erp-data";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { title: "My portal — Scholaris ERP" },
      { name: "description", content: "Personal grades, fee receipts and weekly timetable." },
      { property: "og:title", content: "My portal — Scholaris ERP" },
      { property: "og:description", content: "Personal grades, fee receipts and weekly timetable." },
    ],
  }),
  component: Page,
});

type GradeRow = (typeof myGrades)[number];
type PaymentRow = (typeof myPayments)[number];

const gradeColumns: Column<GradeRow>[] = [
  { key: "subject", header: "Subject", sortable: true },
  { key: "opener", header: "Opener", align: "right" },
  { key: "mid", header: "Mid-term", align: "right" },
  { key: "end", header: "End-term", align: "right", sortable: true },
  { key: "grade", header: "Grade", align: "right" },
  { key: "teacher", header: "Teacher" },
];

const paymentColumns: Column<PaymentRow>[] = [
  { key: "id", header: "Receipt", sortable: true },
  { key: "term", header: "Term" },
  { key: "method", header: "Method" },
  { key: "date", header: "Date", sortable: true },
  { key: "amount", header: "Amount", align: "right" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <>
      <PageHeader
        title="My portal"
        description="Personal grades, fee receipts and weekly timetable."
        endpoint="GET /api/v1/me/overview"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Term mean" value="77.6" delta="+4.2" hint="Term 2 end-term" />
        <KpiCard label="Class position" value="1 / 42" delta="+2" hint="Form 3 East" accent="navy" />
        <KpiCard label="Attendance" value="96.4%" delta="+0.8%" hint="this term" accent="teal" />
        <KpiCard label="Fee balance" value="KES 0" delta="0" hint="fully settled" accent="gold" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Subject progression" description="End-term score per subject">
          <div className="p-4">
            <ComparisonBarChart
              data={[...myGrades]}
              xKey="subject"
              bars={[
                { key: "mid", color: "var(--color-chart-2)" },
                { key: "end", color: "var(--color-chart-1)" },
              ]}
            />
          </div>
        </SectionCard>
        <SectionCard title="Weekly timetable" description="Lessons for the current week">
          <ul className="divide-y divide-border">
            {myTimetable.map((day) => (
              <li key={day.day} className="px-5 py-3">
                <p className="text-sm font-semibold text-foreground">{day.day}</p>
                <p className="mt-1 text-xs text-muted-foreground">{day.slots.join(" · ")}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="My grades" description="Scores across the assessment cycle">
        <DataTable<GradeRow>
          columns={gradeColumns}
          rows={myGrades}
          searchKeys={["subject", "teacher"]}
          searchPlaceholder="Search subjects…"
        />
      </SectionCard>

      <SectionCard title="My payments" description="Receipts issued against my account">
        <DataTable<PaymentRow>
          columns={paymentColumns}
          rows={myPayments}
          searchKeys={["id", "term"]}
          searchPlaceholder="Search receipts…"
        />
      </SectionCard>
    </>
  );
}
