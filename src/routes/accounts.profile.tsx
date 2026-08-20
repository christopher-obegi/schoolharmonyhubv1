import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/components/erp/page-header";
import { DataTable, type Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { auditLogs, users } from "@/lib/erp-data";
import { useRole } from "@/components/erp/role-context";

export const Route = createFileRoute("/accounts/profile")({
  head: () => ({
    meta: [
      { title: "My profile — Scholaris ERP" },
      { name: "description", content: "Account details, assigned roles and recent activity." },
      { property: "og:title", content: "My profile — Scholaris ERP" },
      { property: "og:description", content: "Account details, assigned roles and recent activity." },
    ],
  }),
  component: Page,
});

type AuditRow = (typeof auditLogs)[number];

const auditColumns: Column<AuditRow>[] = [
  { key: "at", header: "Time", sortable: true },
  { key: "action", header: "Action" },
  { key: "target", header: "Target" },
  { key: "severity", header: "Severity", render: (row) => <StatusBadge status={String(row.severity)} /> },
];

function Page() {
  const { role, sections } = useRole();
  const me = users[0]!;

  return (
    <>
      <PageHeader
        title="My profile"
        description="Account details, assigned roles and recent activity."
        endpoint="GET /api/v1/accounts/me"
        actions={<Button variant="outline">Change password</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Account" description="Identity and contact details">
          <div className="space-y-3 p-5 text-sm">
            <p className="text-base font-semibold text-foreground">{me.name}</p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4" /> {me.email}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4" /> Last login: {me.lastLogin}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Shield className="size-4" /> Active session role: {role}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Roles & scope" description="What this account can reach">
          <div className="flex flex-wrap gap-2 p-5">
            <Badge>{me.role}</Badge>
            <Badge variant="secondary">{me.school}</Badge>
            <Badge variant="outline">{me.status}</Badge>
          </div>
        </SectionCard>

        <SectionCard title="Visible modules" description="Derived from the active role">
          <ul className="grid gap-2 p-5 text-sm text-muted-foreground">
            {sections.map((section) => (
              <li key={section}>{section}</li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Recent activity" description="Audit events attributed to this account">
        <DataTable<AuditRow>
          columns={auditColumns}
          rows={auditLogs}
          searchKeys={["action", "target"]}
          searchPlaceholder="Search activity…"
          pageSize={5}
        />
      </SectionCard>
    </>
  );
}
