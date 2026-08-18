import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { roleRows } from "@/lib/erp-data";

export const Route = createFileRoute("/accounts/roles")({
  head: () => ({
    meta: [
      { title: "Roles — Scholaris ERP" },
      { name: "description", content: "Role definitions, scope and permission counts." },
      { property: "og:title", content: "Roles — Scholaris ERP" },
      { property: "og:description", content: "Role definitions, scope and permission counts." },
    ],
  }),
  component: Page,
});

type Row = (typeof roleRows)[number];

const columns: Column<Row>[] = [
    { key: "name", header: "Role", sortable: true },
    { key: "scope", header: "Scope" },
    { key: "members", header: "Members", sortable: true, align: "right" },
    { key: "permissions", header: "Permissions", align: "right" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Roles"
      description="Role definitions, scope and permission counts."
      endpoint="GET /api/v1/roles"
      columns={columns}
      rows={roleRows}
      searchKeys={["name", "scope"]}
      searchPlaceholder="Search roles…"
      filterKey="scope"
      createLabel="Create role"
      createFields={[
      {"name": "name", "label": "Role name", "type": "text", "required": true, "half": false},
      {"name": "scope", "label": "Scope", "type": "select", "required": true, "half": true, "options": ["Platform", "School", "Portal"]},
      {"name": "description", "label": "Description", "type": "textarea", "required": false, "half": false},
      ]}
    />
  );
}
