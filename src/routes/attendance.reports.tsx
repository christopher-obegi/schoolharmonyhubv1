import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import { SectionCard } from "@/components/erp/page-header";
import type { Column } from "@/components/erp/data-table";
import { TrendLineChart } from "@/components/erp/charts";
import { attendanceTrend } from "@/lib/analytics";
import { pageHead, useList, useLookup } from "@/lib/resources";

const DESCRIPTION = "Attendance rates per learner and term, and the daily trend.";

export const Route = createFileRoute("/attendance/reports")({
  head: pageHead("Attendance reports", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  student: string;
  year: string;
  term: string;
  present: number;
  late: number;
  absent: number;
  excused: number;
  rate: string;
  rateValue: number;
};

const columns: Column<Row>[] = [
  { key: "student", header: "Student", sortable: true },
  { key: "year", header: "Year" },
  { key: "term", header: "Term" },
  { key: "present", header: "Present", align: "right" },
  { key: "late", header: "Late", align: "right" },
  { key: "absent", header: "Absent", align: "right" },
  { key: "excused", header: "Excused", align: "right" },
  { key: "rate", header: "Attendance %", align: "right", sortable: true, value: (row) => row.rateValue },
];

function Page() {
  const { data, isLoading, error } = useList("attendanceSummaries");
  const sessions = useList("attendanceSessions");
  const students = useLookup("students");
  const years = useLookup("academicYears");
  const terms = useLookup("terms");

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((s) => ({
        id: s.id,
        student: students.name(s.student),
        year: years.name(s.academic_year),
        term: terms.name(s.term),
        present: Number(s.present_days),
        late: Number(s.late_days),
        absent: Number(s.absent_days),
        excused: Number(s.excused_days),
        rate: `${Number(s.attendance_percentage).toFixed(1)}%`,
        rateValue: Number(s.attendance_percentage),
      })),
    [data, students, years, terms],
  );

  const trend = useMemo(
    () => attendanceTrend(sessions.data ?? []).map(({ day, rate }) => ({ day, rate })),
    [sessions.data],
  );

  return (
    <ModulePage<Row>
      title="Attendance reports"
      description={DESCRIPTION}
      resource="attendanceSummaries"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["student", "term"]}
      searchPlaceholder="Search students…"
      filterKey="term"
      tableTitle="Learner summaries"
      emptyDescription="Summaries are computed by the backend from marked attendance."
      above={
        <SectionCard title="Daily attendance rate" description="Present or late, as a share of learners marked">
          <div className="p-4">
            {trend.length ? (
              <TrendLineChart data={trend} xKey="day" yKey="rate" />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {sessions.isLoading ? "Loading attendance…" : "No attendance has been marked yet."}
              </p>
            )}
          </div>
        </SectionCard>
      }
    />
  );
}
