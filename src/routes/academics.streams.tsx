import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { streams } from "@/lib/erp-data";

export const Route = createFileRoute("/academics/streams")({
  head: () => ({
    meta: [
      { title: "Streams — Scholaris ERP" },
      { name: "description", content: "Stream capacity, rooms and tutors." },
      { property: "og:title", content: "Streams — Scholaris ERP" },
      { property: "og:description", content: "Stream capacity, rooms and tutors." },
    ],
  }),
  component: Page,
});

type Row = (typeof streams)[number];

const columns: Column<Row>[] = [
    { key: "name", header: "Stream", sortable: true },
    { key: "class", header: "Class" },
    { key: "capacity", header: "Capacity", align: "right" },
    { key: "enrolled", header: "Enrolled", sortable: true, align: "right" },
    { key: "room", header: "Room" },
    { key: "tutor", header: "Tutor" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Streams"
      description="Stream capacity, rooms and tutors."
      endpoint="GET /api/v1/streams"
      columns={columns}
      rows={streams}
      searchKeys={["name", "class", "tutor"]}
      searchPlaceholder="Search streams…"
      filterKey="class"
      createLabel="Add stream"
      createFields={[
      {"name": "name", "label": "Stream name", "type": "text", "required": true, "half": true},
      {"name": "class", "label": "Class", "type": "select", "required": true, "half": true, "options": ["Form 1", "Form 2", "Form 3", "Form 4"]},
      {"name": "capacity", "label": "Capacity", "type": "number", "required": true, "half": true},
      {"name": "room", "label": "Room", "type": "text", "required": true, "half": true},
      {"name": "tutor", "label": "Tutor", "type": "text", "required": true, "half": true},
      ]}
    />
  );
}
