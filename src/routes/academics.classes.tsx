import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { classes } from "@/lib/erp-data";

export const Route = createFileRoute("/academics/classes")({
  head: () => ({
    meta: [
      { title: "Classes — Scholaris ERP" },
      { name: "description", content: "Class levels, streams count and class teachers." },
      { property: "og:title", content: "Classes — Scholaris ERP" },
      { property: "og:description", content: "Class levels, streams count and class teachers." },
    ],
  }),
  component: Page,
});

type Row = (typeof classes)[number];

const columns: Column<Row>[] = [
    { key: "name", header: "Class", sortable: true },
    { key: "group", header: "Group" },
    { key: "streams", header: "Streams", align: "right" },
    { key: "students", header: "Students", sortable: true, align: "right" },
    { key: "teacher", header: "Class teacher" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Classes"
      description="Class levels, streams count and class teachers."
      endpoint="GET /api/v1/classes"
      columns={columns}
      rows={classes}
      searchKeys={["name", "teacher", "group"]}
      searchPlaceholder="Search classes…"
      filterKey="group"
      createLabel="Add class"
      createFields={[
      {"name": "name", "label": "Class name", "type": "text", "required": true, "half": true},
      {"name": "group", "label": "Group", "type": "select", "required": true, "half": true, "options": ["Lower Secondary", "Upper Secondary", "Primary"]},
      {"name": "teacher", "label": "Class teacher", "type": "text", "required": true, "half": true},
      {"name": "capacity", "label": "Capacity", "type": "number", "required": false, "half": true},
      ]}
    />
  );
}
