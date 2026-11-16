import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/components/erp/page-header";
import { DataTable, type Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { CollectionsAreaChart, ComparisonBarChart } from "@/components/erp/charts";
import { KpiCard } from "@/components/erp/kpi-card";
import { useRole } from "@/components/erp/role-context";
import { compactMoney, feeTotals, monthlyFinance } from "@/lib/analytics";
import {
  dateTime,
  humanize,
  money,
  pageHead,
  shortDate,
  useList,
  useLookup,
} from "@/lib/resources";

const DESCRIPTION = "Cross-module analytics, exports and audit visibility.";

export const Route = createFileRoute("/reports")({
  head: pageHead("Reports & audit", DESCRIPTION),
  component: Page,
});

type AuditRow = {
  id: number;
  actor: string;
  action: string;
  target: string;
  at: string;
  timestamp: string;
};
type DiscountRow = {
  id: number;
  name: string;
  student: string;
  type: string;
  value: string;
  period: string;
  status: string;
};

const auditColumns: Column<AuditRow>[] = [
  { key: "actor", header: "Actor", sortable: true },
  { key: "action", header: "Action" },
  { key: "target", header: "Target" },
  { key: "at", header: "Time", sortable: true, value: (row) => row.timestamp },
];

const discountColumns: Column<DiscountRow>[] = [
  { key: "name", header: "Scheme", sortable: true },
  { key: "student", header: "Student", sortable: true },
  { key: "type", header: "Type" },
  { key: "value", header: "Value", align: "right" },
  { key: "period", header: "Period" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function downloadCsv(filename: string, rows: Record<string, string | number>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]!);
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h] ?? "")).join(",")),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  link.click();
  URL.revokeObjectURL(url);
}

function Page() {
  const canAudit = useRole().can("audit_logs");
  const invoices = useList("invoices");
  const payments = useList("payments");
  const discounts = useList("discounts");
  const students = useList("students");
  const auditLogs = useList("auditLogs");
  const studentNames = useLookup("students");
  const classes = useLookup("classes");

  const totals = useMemo(
    () => feeTotals(invoices.data ?? [], payments.data ?? []),
    [invoices.data, payments.data],
  );
  const monthly = useMemo(
    () => monthlyFinance(invoices.data ?? [], payments.data ?? []),
    [invoices.data, payments.data],
  );
  const collectionRate = totals.invoiced ? (totals.collected / totals.invoiced) * 100 : 0;

  /** Paid vs outstanding per class, using each student's current class. */
  const byClass = useMemo(() => {
    const classOf = new Map((students.data ?? []).map((s) => [s.id, Number(s.current_class)]));
    const map = new Map<string, { collected: number; due: number }>();
    for (const invoice of invoices.data ?? []) {
      if (invoice.status === "CANCELLED") continue;
      const name = classes.name(classOf.get(Number(invoice.student)) || null);
      const entry = map.get(name) ?? { collected: 0, due: 0 };
      entry.due += Number(invoice.balance);
      entry.collected += Number(invoice.total_amount) - Number(invoice.balance);
      map.set(name, entry);
    }
    return [...map.entries()].map(([name, v]) => ({ name, ...v }));
  }, [invoices.data, students.data, classes]);

  const discountRows = useMemo<DiscountRow[]>(
    () =>
      (discounts.data ?? []).map((d) => ({
        id: d.id,
        name: String(d.name),
        student: studentNames.name(d.student),
        type: humanize(d.discount_type),
        value: d.discount_type === "PERCENTAGE" ? `${Number(d.value)}%` : money(d.value),
        period: `${shortDate(d.start_date)} – ${d.end_date ? shortDate(d.end_date) : "open"}`,
        status: d.is_active ? "Active" : "Inactive",
      })),
    [discounts.data, studentNames],
  );

  const auditRows = useMemo<AuditRow[]>(
    () =>
      (auditLogs.data ?? []).map((log) => ({
        id: log.id,
        actor: String(log.user ?? "System"),
        action: humanize(log.action),
        target: `${log.model_name}${log.object_id ? ` #${log.object_id}` : ""}`,
        at: dateTime(log.timestamp),
        timestamp: String(log.timestamp),
      })),
    [auditLogs.data],
  );

  const exportInvoices = () =>
    downloadCsv(
      `invoices-${new Date().toISOString().slice(0, 10)}.csv`,
      (invoices.data ?? []).map((i) => ({
        invoice: String(i.invoice_number ?? i.id),
        student: studentNames.name(i.student),
        issue_date: String(i.issue_date ?? ""),
        due_date: String(i.due_date ?? ""),
        status: String(i.status),
        total_amount: Number(i.total_amount),
        balance: Number(i.balance),
      })),
    );

  const financeError = invoices.error ?? payments.error;

  return (
    <>
      <PageHeader
        title="Reports & audit"
        description={DESCRIPTION}
        actions={
          <Button variant="outline" onClick={exportInvoices} disabled={!invoices.data?.length}>
            <FileBarChart className="mr-1 size-4" /> Export invoices CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Collection rate"
          value={financeError ? "—" : `${collectionRate.toFixed(1)}%`}
          hint={
            financeError
              ? "No access"
              : `${compactMoney(totals.collected)} of ${compactMoney(totals.invoiced)}`
          }
          loading={invoices.isLoading || payments.isLoading}
          accent="navy"
        />
        <KpiCard
          label="Outstanding"
          value={invoices.error ? "—" : compactMoney(totals.outstanding)}
          hint={invoices.error ? "No access" : `${totals.accountsInArrears} students`}
          loading={invoices.isLoading}
        />
        <KpiCard
          label="Active discounts"
          value={
            discounts.error ? "—" : String(discountRows.filter((d) => d.status === "Active").length)
          }
          hint={discounts.error ? "No access" : `${discountRows.length} in total`}
          loading={discounts.isLoading}
          accent="gold"
        />
        <KpiCard
          label="Audit events"
          value={canAudit ? (auditLogs.data?.length ?? 0).toLocaleString() : "—"}
          hint={canAudit ? "recorded" : "Admins only"}
          loading={auditLogs.isLoading && canAudit}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Collections vs invoiced"
          description={`KES by month, ${new Date().getFullYear()}`}
        >
          <div className="p-4">
            {financeError ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {financeError instanceof Error ? financeError.message : "Not available"}
              </p>
            ) : monthly.some((m) => m.invoiced || m.collected) ? (
              <CollectionsAreaChart data={monthly} />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No invoices or payments this year.
              </p>
            )}
          </div>
        </SectionCard>
        <SectionCard title="Collections by class" description="Paid vs outstanding (KES)">
          <div className="p-4">
            {byClass.length ? (
              <ComparisonBarChart
                data={byClass}
                xKey="name"
                bars={[
                  { key: "collected", color: "var(--color-chart-1)" },
                  { key: "due", color: "var(--color-chart-3)" },
                ]}
              />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {invoices.isLoading ? "Loading…" : "No invoices yet."}
              </p>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Discounts & bursaries" description="Waivers granted to students">
        <DataTable<DiscountRow>
          columns={discountColumns}
          rows={discountRows}
          loading={discounts.isLoading}
          searchKeys={["name", "student"]}
          searchPlaceholder="Search schemes…"
          emptyDescription={discounts.error instanceof Error ? discounts.error.message : undefined}
        />
      </SectionCard>

      {canAudit ? (
        <SectionCard title="Audit trail" description="Most recent privileged activity">
          <DataTable<AuditRow>
            columns={auditColumns}
            rows={auditRows}
            loading={auditLogs.isLoading}
            searchKeys={["actor", "action", "target"]}
            searchPlaceholder="Search audit events…"
            pageSize={6}
          />
        </SectionCard>
      ) : null}
    </>
  );
}
