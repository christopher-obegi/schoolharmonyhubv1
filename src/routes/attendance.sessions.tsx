import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { attendanceSessions } from "@/lib/erp-data";

export const Route = createFileRoute("/attendance/sessions")({
  head: () => ({
    meta: [
      { title: "Attendance sessions — Scholaris ERP" },
      { name: "description", content: "Open and close daily marking sessions per stream." },
      { property: "og:title", content: "Attendance sessions — Scholaris ERP" },
      { property: "og:description", content: "Open and close daily marking sessions per stream." },
    ],
  }),
  component: Page,
});

type Row = (typeof attendanceSessions)[number];

const columns: Column<Row>[] = [
    { key: "date", header: "Date", sortable: true },
    { key: "class", header: "Class" },
    { key: "stream", header: "Stream" },
    { key: "period", header: "Period" },
    { key: "marked", header: "Marked", align: "right" },
    { key: "expected", header: "Expected", align: "right" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Attendance sessions"
      description="Open and close daily marking sessions per stream."
      endpoint="GET /api/v1/attendance/sessions"
      columns={columns}
      rows={attendanceSessions}
      searchKeys={["class", "stream", "date"]}
      searchPlaceholder="Search attendance sessions…"
      filterKey="status"
      createLabel="Open session"
      createFields={[
      {"name": "class", "label": "Class", "type": "select", "required": true, "half": true, "options": ["Form 1", "Form 2", "Form 3", "Form 4"]},
      {"name": "stream", "label": "Stream", "type": "text", "required": true, "half": true},
      {"name": "date", "label": "Date", "type": "date", "required": true, "half": true},
      {"name": "period", "label": "Period", "type": "select", "required": true, "half": true, "options": ["Morning", "Afternoon"]},
      ]}
    />
  );
}
