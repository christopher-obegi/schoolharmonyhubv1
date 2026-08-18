import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import { StatusBadge } from "@/components/erp/status-badge";
import { users } from "@/lib/erp-data";

export const Route = createFileRoute("/accounts/users")({
  head: () => ({
    meta: [
      { title: "Users — Scholaris ERP" },
      { name: "description", content: "Invite staff, assign roles and control account status per school." },
      { property: "og:title", content: "Users — Scholaris ERP" },
      { property: "og:description", content: "Invite staff, assign roles and control account status per school." },
    ],
  }),
  component: Page,
});

const columns = [
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email" },
    { key: "role", header: "Role", sortable: true },
    { key: "school", header: "School" },
    { key: "lastLogin", header: "Last login", sortable: true },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Users"
      description="Invite staff, assign roles and control account status per school."
      endpoint="GET /api/v1/users"
      columns={columns}
      rows={users}
      searchKeys={["name", "email", "role", "school"]}
      searchPlaceholder="Search users…"
      filterKey="role"
      createLabel="Invite user"
      createFields={[
      {"name": "name", "label": "Full name", "type": "text", "required": true, "half": false},
      {"name": "email", "label": "Email address", "type": "email", "required": true, "half": true},
      {"name": "role", "label": "Role", "type": "select", "required": true, "half": true, "options": ["Super Admin", "School Admin", "Teacher", "Admissions Officer", "Exam Admin", "Finance Officer", "Parent", "Student"]},
      {"name": "school", "label": "School", "type": "select", "required": true, "half": true, "options": ["Riverside Academy", "Hillcrest High", "Lakeview Junior", "Summit Boys"]},
      {"name": "phone", "label": "Phone", "type": "text", "required": false, "half": true},
      ]}
    />
  );
}
