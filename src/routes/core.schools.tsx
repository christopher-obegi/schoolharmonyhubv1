import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { schools } from "@/lib/erp-data";

export const Route = createFileRoute("/core/schools")({
  head: () => ({
    meta: [
      { title: "Schools — Scholaris ERP" },
      { name: "description", content: "Manage tenant schools, codes, campuses and onboarding status." },
      { property: "og:title", content: "Schools — Scholaris ERP" },
      { property: "og:description", content: "Manage tenant schools, codes, campuses and onboarding status." },
    ],
  }),
  component: Page,
});

type Row = (typeof schools)[number];

const columns: Column<Row>[] = [
    { key: "name", header: "School", sortable: true },
    { key: "code", header: "Code", render: (row) => <span className="font-mono text-xs">{String(row.code)}</span> },
    { key: "type", header: "Type" },
    { key: "town", header: "Town" },
    { key: "students", header: "Students", sortable: true, align: "right" },
    { key: "staff", header: "Staff", align: "right" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Schools"
      description="Manage tenant schools, codes, campuses and onboarding status."
      endpoint="GET /api/v1/schools"
      columns={columns}
      rows={schools}
      searchKeys={["name", "code", "town"]}
      searchPlaceholder="Search schools…"
      filterKey="type"
      createLabel="Add school"
      createFields={[
      {"name": "name", "label": "School name", "type": "text", "required": true, "half": false},
      {"name": "code", "label": "School code", "type": "text", "required": true, "half": true},
      {"name": "type", "label": "Type", "type": "select", "required": true, "half": true, "options": ["Primary", "Secondary", "Mixed"]},
      {"name": "town", "label": "Town", "type": "text", "required": true, "half": true},
      {"name": "email", "label": "Contact email", "type": "email", "required": true, "half": true},
      ]}
    />
  );
}
