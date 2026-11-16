import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { RoleTag, StatusBadge } from "@/components/erp/status-badge";
import { RecordDialog } from "@/components/erp/forms";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  activeStatus,
  dateTime,
  pageHead,
  payload,
  useCan,
  useCreate,
  useList,
  useLookup,
  useSchoolField,
} from "@/lib/resources";

const DESCRIPTION = "Create staff accounts, assign roles and control account status per school.";

export const Route = createFileRoute("/accounts/users")({
  head: pageHead("Users", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  name: string;
  email: string;
  role: string;
  codes: string[];
  school: string;
  lastLogin: string;
  lastLoginRaw: string;
  status: string;
};

const columns: Column<Row>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "email", header: "Email" },
  { key: "role", header: "Role", sortable: true, render: (row) => <RoleTag role={row.role} /> },
  { key: "school", header: "School" },
  { key: "lastLogin", header: "Last login", sortable: true, value: (row) => row.lastLoginRaw },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function Page() {
  const { data, isLoading, error } = useList("users");
  const create = useCreate("users");
  const schools = useLookup("schools");
  const roles = useLookup("roles");
  const schoolField = useSchoolField();
  const canEdit = useCan()("users", true);
  const { user: me } = useAuth();
  const queryClient = useQueryClient();

  const roleOptions = useMemo(
    () => roles.rows.map((r) => ({ value: String(r.code), label: String(r.name) })),
    [roles.rows],
  );
  const roleName = useMemo(() => {
    const byCode = new Map(roles.rows.map((r) => [String(r.code), String(r.name)]));
    return (code: string) => byCode.get(code) ?? code;
  }, [roles.rows]);

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((u) => {
        const codes = (u.roles as string[] | undefined) ?? [];
        return {
          id: u.id,
          name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || String(u.username),
          email: String(u.email),
          role: u.is_superuser
            ? "Super Admin"
            : codes.length
              ? codes.map(roleName).join(", ")
              : "No role",
          codes,
          school: schools.name(u.school),
          lastLogin: u.last_login ? dateTime(u.last_login) : "Never",
          lastLoginRaw: String(u.last_login ?? ""),
          status: activeStatus(u.is_active),
        };
      }),
    [data, roleName, schools],
  );

  const editRoles = (row: Row) =>
    row.id === me?.id ? (
      <span className="text-xs text-muted-foreground">You</span>
    ) : (
      <RecordDialog
        trigger={
          <Button variant="outline" size="sm">
            Edit roles
          </Button>
        }
        title={`Roles for ${row.name}`}
        description="A user can hold several roles; they get the combined access of all of them."
        submitLabel="Save roles"
        fields={[
          {
            name: "role_codes",
            label: "Roles",
            type: "checkboxes",
            options: roleOptions,
            defaultValue: row.codes.join(","),
          },
        ]}
        onSubmit={async (values) => {
          await api(`/api/accounts/users/${row.id}/roles/`, {
            method: "POST",
            body: { role_codes: (values["role_codes"] ?? "").split(",").filter(Boolean) },
          });
          await queryClient.invalidateQueries({ queryKey: ["api", "users"] });
        }}
      />
    );

  return (
    <ModulePage<Row>
      title="Users"
      description={DESCRIPTION}
      resource="users"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["name", "email", "role", "school"]}
      searchPlaceholder="Search users…"
      filterKey="role"
      rowActions={canEdit ? editRoles : undefined}
      createLabel="Add user"
      onCreate={async (values) => {
        const { role_codes, ...rest } = values;
        await create({
          ...payload(rest),
          role_codes: (role_codes ?? "").split(",").filter(Boolean),
        });
      }}
      createFields={[
        { name: "first_name", label: "First name", required: true, half: true },
        { name: "last_name", label: "Last name", required: true, half: true },
        { name: "email", label: "Email address", type: "email", required: true, half: true },
        { name: "username", label: "Username", required: true, half: true },
        {
          name: "password",
          label: "Temporary password",
          type: "password",
          required: true,
          half: true,
          hint: "At least 8 characters. Share it with the user securely.",
        },
        { name: "phone_number", label: "Phone", half: true, placeholder: "+254712345678" },
        { ...schoolField, required: false },
        {
          name: "role_codes",
          label: "Roles",
          type: "checkboxes",
          options: roleOptions,
          hint: roleOptions.length
            ? "Pick one or more."
            : "No roles defined yet. Create one under Roles.",
        },
      ]}
    />
  );
}
