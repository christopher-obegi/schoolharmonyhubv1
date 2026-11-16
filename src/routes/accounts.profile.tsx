import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Building2, Clock, Mail, Phone, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/components/erp/page-header";
import { DataTable, type Column } from "@/components/erp/data-table";
import { RecordDialog } from "@/components/erp/forms";
import { StatusBadge } from "@/components/erp/status-badge";
import { useRole, type Area } from "@/components/erp/role-context";
import { api } from "@/lib/api";
import { displayName, useAuth } from "@/lib/auth";
import { dateTime, humanize, pageHead, payload, useList, useLookup } from "@/lib/resources";

const DESCRIPTION = "Account details, assigned roles and recent activity.";

const AREA_LABELS: [Area, string][] = [
  ["schools", "Schools"],
  ["users", "Users"],
  ["roles", "Roles & permissions"],
  ["audit_logs", "Audit logs"],
  ["academics", "Academic setup"],
  ["subject_assignments", "Subject assignments"],
  ["students", "Students"],
  ["guardians", "Parents & guardians"],
  ["enrollments", "Enrollments"],
  ["documents", "Student documents"],
  ["attendance", "Attendance"],
  ["attendance_summaries", "Attendance reports"],
  ["exams", "Exams & grade scales"],
  ["marks", "Marks"],
  ["results", "Results"],
  ["finance", "Fees setup"],
  ["finance_ledger", "Invoices, payments & accounts"],
];

export const Route = createFileRoute("/accounts/profile")({
  head: pageHead("My profile", DESCRIPTION),
  component: Page,
});

type AuditRow = { id: number; at: string; timestamp: string; action: string; target: string };

const auditColumns: Column<AuditRow>[] = [
  { key: "at", header: "Time", sortable: true, value: (row) => row.timestamp },
  { key: "action", header: "Action", render: (row) => <StatusBadge status="info" label={humanize(row.action)} /> },
  { key: "target", header: "Target" },
];

function Page() {
  const { role, can } = useRole();
  const { user, refreshUser } = useAuth();
  const schools = useLookup("schools");
  const auditLogs = useList("auditLogs");

  const myActivity = useMemo<AuditRow[]>(
    () =>
      (auditLogs.data ?? [])
        .filter((log) => log.user === user?.email)
        .map((log) => ({
          id: log.id,
          at: dateTime(log.timestamp),
          timestamp: String(log.timestamp),
          action: String(log.action),
          target: `${log.model_name}${log.object_id ? ` #${log.object_id}` : ""}`,
        })),
    [auditLogs.data, user?.email],
  );

  if (!user) return null;

  return (
    <>
      <PageHeader
        title="My profile"
        description={DESCRIPTION}
        actions={
          <>
            <RecordDialog
              trigger={<Button variant="outline">Edit details</Button>}
              title="Edit details"
              submitLabel="Save changes"
              fields={[
                { name: "first_name", label: "First name", half: true, defaultValue: user.first_name },
                { name: "last_name", label: "Last name", half: true, defaultValue: user.last_name },
                { name: "phone_number", label: "Phone", defaultValue: user.phone_number, placeholder: "+254712345678" },
              ]}
              onSubmit={async (values) => {
                await api("/api/accounts/profile/update/", { method: "PATCH", body: payload(values) });
                await refreshUser();
              }}
            />
            <RecordDialog
              trigger={<Button>Change password</Button>}
              title="Change password"
              submitLabel="Update password"
              fields={[
                { name: "old_password", label: "Current password", type: "password", required: true },
                {
                  name: "new_password",
                  label: "New password",
                  type: "password",
                  required: true,
                  hint: "At least 8 characters.",
                },
              ]}
              onSubmit={async (values) => {
                await api("/api/accounts/users/change_password/", { method: "POST", body: values });
              }}
            />
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Account" description="Identity and contact details">
          <div className="space-y-3 p-5 text-sm">
            <p className="text-base font-semibold text-foreground">{displayName(user)}</p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4" /> {user.email}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4" /> {user.phone_number || "No phone number"}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4" /> Last login: {user.last_login ? dateTime(user.last_login) : "—"}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Shield className="size-4" /> Signed in as: {role}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Roles & scope" description="What this account can reach">
          <div className="flex flex-wrap gap-2 p-5">
            {user.is_superuser ? <Badge>Superuser</Badge> : null}
            {user.roles.map((code) => (
              <Badge key={code}>{humanize(code)}</Badge>
            ))}
            {!user.is_superuser && !user.roles.length ? <Badge variant="outline">No roles assigned</Badge> : null}
            <Badge variant="secondary">
              <Building2 className="mr-1 size-3" />
              {user.school != null ? schools.name(user.school) : "All schools"}
            </Badge>
            <Badge variant="outline">{user.is_active ? "Active" : "Inactive"}</Badge>
          </div>
        </SectionCard>

        <SectionCard title="Access" description="What your roles allow, as enforced by the API">
          <ul className="divide-y divide-border text-sm">
            {AREA_LABELS.map(([area, label]) => {
              const level = can(area, true) ? "Read & write" : can(area) ? "Read only" : null;
              return level ? (
                <li key={area} className="flex items-center justify-between gap-3 px-5 py-2">
                  <span className="text-foreground">{label}</span>
                  <span className="text-xs text-muted-foreground">{level}</span>
                </li>
              ) : null;
            })}
          </ul>
        </SectionCard>
      </div>

      {can("audit_logs") ? (
        <SectionCard title="Recent activity" description="Audit events attributed to this account">
          <DataTable<AuditRow>
            columns={auditColumns}
            rows={myActivity}
            loading={auditLogs.isLoading}
            searchKeys={["action", "target"]}
            searchPlaceholder="Search activity…"
            pageSize={5}
          />
        </SectionCard>
      ) : null}
    </>
  );
}
