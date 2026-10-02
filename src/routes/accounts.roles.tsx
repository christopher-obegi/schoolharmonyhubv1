import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { endpointLabel, pageHead, payload, useCreate, useList } from "@/lib/resources";

const DESCRIPTION = "Role definitions, codes and permission counts.";

export const Route = createFileRoute("/accounts/roles")({
  head: pageHead("Roles", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  name: string;
  code: string;
  description: string;
  permissions: number;
  type: string;
};

const columns: Column<Row>[] = [
  { key: "name", header: "Role", sortable: true },
  { key: "code", header: "Code", render: (row) => <span className="font-mono text-xs">{row.code}</span> },
  { key: "description", header: "Description" },
  { key: "permissions", header: "Permissions", sortable: true, align: "right" },
  { key: "type", header: "Type", render: (row) => <StatusBadge status={row.type} /> },
];

function Page() {
  const { data, isLoading, error } = useList("roles");
  const create = useCreate("roles");

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((r) => ({
        id: r.id,
        name: String(r.name),
        code: String(r.code),
        description: String(r.description || "—"),
        permissions: Array.isArray(r.permissions) ? r.permissions.length : 0,
        type: r.is_system_role ? "System" : "Custom",
      })),
    [data],
  );

  return (
    <ModulePage<Row>
      title="Roles"
      description={DESCRIPTION}
      resource="roles"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["name", "code", "description"]}
      searchPlaceholder="Search roles…"
      filterKey="type"
      emptyTitle="No roles yet"
      emptyDescription="Role codes the backend checks: SCHOOL_ADMIN, TEACHER, ADMISSIONS_OFFICER, FINANCE_OFFICER, PARENT, STUDENT."
      createLabel="Create role"
      onCreate={async (values) => {
        await create(payload(values));
      }}
      createFields={[
        { name: "name", label: "Role name", required: true, half: true },
        {
          name: "code",
          label: "Code",
          required: true,
          half: true,
          placeholder: "SCHOOL_ADMIN",
          hint: "Permissions are checked against this code.",
        },
        { name: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
