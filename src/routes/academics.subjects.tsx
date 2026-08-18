import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import { StatusBadge } from "@/components/erp/status-badge";
import { subjects } from "@/lib/erp-data";

export const Route = createFileRoute("/academics/subjects")({
  head: () => ({
    meta: [
      { title: "Subjects — Scholaris ERP" },
      { name: "description", content: "Subject catalogue by department and type." },
      { property: "og:title", content: "Subjects — Scholaris ERP" },
      { property: "og:description", content: "Subject catalogue by department and type." },
    ],
  }),
  component: Page,
});

const columns = [
    { key: "code", header: "Code", render: (row) => <span className="font-mono text-xs">{String(row.code)}</span> },
    { key: "name", header: "Subject", sortable: true },
    { key: "department", header: "Department" },
    { key: "type", header: "Type" },
    { key: "teachers", header: "Teachers", align: "right" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Subjects"
      description="Subject catalogue by department and type."
      endpoint="GET /api/v1/subjects"
      columns={columns}
      rows={subjects}
      searchKeys={["name", "code", "department"]}
      searchPlaceholder="Search subjects…"
      filterKey="department"
      createLabel="Add subject"
      createFields={[
      {"name": "name", "label": "Subject name", "type": "text", "required": true, "half": true},
      {"name": "code", "label": "Subject code", "type": "text", "required": true, "half": true},
      {"name": "department", "label": "Department", "type": "select", "required": true, "half": true, "options": ["Sciences", "Languages", "Humanities", "Technicals"]},
      {"name": "type", "label": "Type", "type": "select", "required": true, "half": true, "options": ["Core", "Elective"]},
      ]}
    />
  );
}
