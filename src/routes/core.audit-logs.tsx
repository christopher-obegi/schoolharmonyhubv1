import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { auditLogs } from "@/lib/erp-data";

export const Route = createFileRoute("/core/audit-logs")({
  head: () => ({
    meta: [
      { title: "Audit logs — Scholaris ERP" },
      { name: "description", content: "Immutable trail of every privileged action across the platform." },
      { property: "og:title", content: "Audit logs — Scholaris ERP" },
      { property: "og:description", content: "Immutable trail of every privileged action across the platform." },
    ],
  }),
  component: Page,
});

type Row = (typeof auditLogs)[number];

const columns: Column<Row>[] = [
    { key: "at", header: "Timestamp", sortable: true },
    { key: "actor", header: "Actor" },
    { key: "action", header: "Action", render: (row) => <span className="font-mono text-xs">{String(row.action)}</span> },
    { key: "target", header: "Target" },
    { key: "ip", header: "IP", render: (row) => <span className="font-mono text-xs">{String(row.ip)}</span> },
    { key: "severity", header: "Severity", render: (row) => <StatusBadge status={String(row.severity)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Audit logs"
      description="Immutable trail of every privileged action across the platform."
      endpoint="GET /api/v1/audit-logs"
      columns={columns}
      rows={auditLogs}
      searchKeys={["actor", "action", "target"]}
      searchPlaceholder="Search audit logs…"
      filterKey="severity"
    />
  );
}
