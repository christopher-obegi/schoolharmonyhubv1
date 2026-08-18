import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { enrollments } from "@/lib/erp-data";

export const Route = createFileRoute("/students/enrollments")({
  head: () => ({
    meta: [
      { title: "Enrollments — Scholaris ERP" },
      { name: "description", content: "Year-on-year enrollment, promotion and transfer records." },
      { property: "og:title", content: "Enrollments — Scholaris ERP" },
      { property: "og:description", content: "Year-on-year enrollment, promotion and transfer records." },
    ],
  }),
  component: Page,
});

type Row = (typeof enrollments)[number];

const columns: Column<Row>[] = [
    { key: "student", header: "Student", sortable: true },
    { key: "year", header: "Year" },
    { key: "class", header: "Class" },
    { key: "stream", header: "Stream" },
    { key: "date", header: "Date", sortable: true },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Enrollments"
      description="Year-on-year enrollment, promotion and transfer records."
      endpoint="GET /api/v1/enrollments"
      columns={columns}
      rows={enrollments}
      searchKeys={["student", "class", "stream"]}
      searchPlaceholder="Search enrollments…"
      filterKey="year"
      createLabel="New enrollment"
      createFields={[
      {"name": "student", "label": "Student", "type": "text", "required": true, "half": true},
      {"name": "year", "label": "Academic year", "type": "select", "required": true, "half": true, "options": ["2026", "2027"]},
      {"name": "class", "label": "Class", "type": "select", "required": true, "half": true, "options": ["Form 1", "Form 2", "Form 3", "Form 4"]},
      {"name": "stream", "label": "Stream", "type": "text", "required": false, "half": true},
      ]}
    />
  );
}
