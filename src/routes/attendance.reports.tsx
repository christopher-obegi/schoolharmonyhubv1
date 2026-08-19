import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { SectionCard } from "@/components/erp/page-header";
import { TrendLineChart } from "@/components/erp/charts";
import { attendanceSeries, attendanceSummaries } from "@/lib/erp-data";

export const Route = createFileRoute("/attendance/reports")({
  head: () => ({
    meta: [
      { title: "Attendance reports — Scholaris ERP" },
      { name: "description", content: "Attendance rates by class, stream and term." },
      { property: "og:title", content: "Attendance reports — Scholaris ERP" },
      { property: "og:description", content: "Attendance rates by class, stream and term." },
    ],
  }),
  component: Page,
});

type Row = (typeof attendanceSummaries)[number];

const columns: Column<Row>[] = [
  { key: "class", header: "Class", sortable: true },
  { key: "stream", header: "Stream" },
  { key: "term", header: "Term" },
  { key: "sessions", header: "Sessions", align: "right" },
  { key: "present", header: "Present %", align: "right", sortable: true },
  { key: "late", header: "Late %", align: "right" },
  { key: "absent", header: "Absent %", align: "right" },
];

function Page() {
  return (
    <ModulePage<Row>
      title="Attendance reports"
      description="Attendance rates by class, stream and term."
      endpoint="GET /api/v1/attendance/reports"
      columns={columns}
      rows={attendanceSummaries}
      searchKeys={["class", "stream"]}
      searchPlaceholder="Search classes…"
      filterKey="class"
      tableTitle="Stream summary"
      above={
        <SectionCard title="Weekly attendance rate" description="Platform-wide daily average">
          <div className="p-4">
            <TrendLineChart data={[...attendanceSeries]} xKey="day" yKey="rate" />
          </div>
        </SectionCard>
      }
    />
  );
}
