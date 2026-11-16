import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { dateTime, humanize, pageHead, useList } from "@/lib/resources";

const DESCRIPTION = "Immutable trail of every privileged action across the platform.";

export const Route = createFileRoute("/core/audit-logs")({
  head: pageHead("Audit logs", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  at: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  description: string;
  ip: string;
};

/** Tone for each audit action, using the badge's existing vocabulary. */
const ACTION_TONE: Record<string, string> = {
  DELETE: "critical",
  UPDATE: "warning",
  CREATE: "info",
  LOGIN: "active",
  LOGOUT: "closed",
  EXPORT: "info",
  IMPORT: "info",
};

const columns: Column<Row>[] = [
  { key: "at", header: "Timestamp", sortable: true, value: (row) => row.timestamp },
  { key: "actor", header: "Actor" },
  {
    key: "action",
    header: "Action",
    render: (row) => (
      <StatusBadge status={ACTION_TONE[row.action] ?? "info"} label={humanize(row.action)} />
    ),
  },
  { key: "target", header: "Target" },
  { key: "description", header: "Description" },
  { key: "ip", header: "IP", render: (row) => <span className="font-mono text-xs">{row.ip}</span> },
];

function Page() {
  const { data, isLoading, error } = useList("auditLogs");

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((log) => ({
        id: log.id,
        at: dateTime(log.timestamp),
        timestamp: String(log.timestamp),
        actor: String(log.user ?? "System"),
        action: String(log.action),
        target: `${log.model_name}${log.object_id ? ` #${log.object_id}` : ""}`,
        description: String(log.description || "—"),
        ip: String(log.ip_address ?? "—"),
      })),
    [data],
  );

  return (
    <ModulePage<Row>
      title="Audit logs"
      description={DESCRIPTION}
      resource="auditLogs"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["actor", "action", "target", "description"]}
      searchPlaceholder="Search audit logs…"
      filterKey="action"
      emptyTitle="No audit entries yet"
      emptyDescription="Privileged actions such as creating users or schools appear here."
    />
  );
}
