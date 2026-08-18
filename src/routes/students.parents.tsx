import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { guardians } from "@/lib/erp-data";

export const Route = createFileRoute("/students/parents")({
  head: () => ({
    meta: [
      { title: "Parents & guardians — Scholaris ERP" },
      { name: "description", content: "Guardian contacts, linked students and portal access." },
      { property: "og:title", content: "Parents & guardians — Scholaris ERP" },
      { property: "og:description", content: "Guardian contacts, linked students and portal access." },
    ],
  }),
  component: Page,
});

type Row = (typeof guardians)[number];

const columns: Column<Row>[] = [
    { key: "name", header: "Guardian", sortable: true },
    { key: "relation", header: "Relation" },
    { key: "phone", header: "Phone", render: (row) => <span className="font-mono text-xs">{String(row.phone)}</span> },
    { key: "email", header: "Email" },
    { key: "students", header: "Students", align: "right" },
    { key: "portal", header: "Portal", render: (row) => <StatusBadge status={String(row.portal)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Parents & guardians"
      description="Guardian contacts, linked students and portal access."
      endpoint="GET /api/v1/guardians"
      columns={columns}
      rows={guardians}
      searchKeys={["name", "phone", "email"]}
      searchPlaceholder="Search parents & guardians…"
      filterKey="relation"
      createLabel="Add guardian"
      createFields={[
      {"name": "name", "label": "Full name", "type": "text", "required": true, "half": false},
      {"name": "relation", "label": "Relation", "type": "select", "required": true, "half": true, "options": ["Father", "Mother", "Guardian"]},
      {"name": "phone", "label": "Phone", "type": "text", "required": true, "half": true},
      {"name": "email", "label": "Email", "type": "email", "required": true, "half": true},
      ]}
    />
  );
}
