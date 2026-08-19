import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/components/erp/page-header";
import { DataTable, type Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { CollectionsAreaChart, ComparisonBarChart } from "@/components/erp/charts";
import { KpiCard } from "@/components/erp/kpi-card";
import { auditLogs, collectionsByClass, discounts, revenueSeries } from "@/lib/erp-data";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports & audit — Scholaris ERP" },
      { name: "description", content: "Cross-module analytics, exports and audit visibility." },
      { property: "og:title", content: "Reports & audit — Scholaris ERP" },
      { property: "og:description", content: "Cross-module analytics, exports and audit visibility." },
    ],
  }),
  component: Page,
});

type AuditRow = (typeof auditLogs)[number];
type DiscountRow = (typeof discounts)[number];

const auditColumns: Column<AuditRow>[] = [
  { key: "actor", header: "Actor", sortable: true },
  { key: "action", header: "Action" },
  { key: "target", header: "Target" },
  { key: "time", header: "Time", sortable: true },
];

const discountColumns: Column<DiscountRow>[] = [
  { key: "name", header: "Scheme", sortable: true },
  { key: "type", header: "Type" },
  { key: "value", header: "Value", align: "right" },
  { key: "beneficiaries", header: "Beneficiaries", align: "right", sortable: true },
  { key: "sponsor", header: "Sponsor" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <>
      <PageHeader
        title="Reports & audit"
        description="Cross-module analytics, exports and audit visibility."
        endpoint="GET /api/v1/reports"
        actions={
          <Button variant="outline">
            <FileBarChart className="mr-1 size-4" /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Reports generated" value="184" delta="+12" hint="this term" />
        <KpiCard label="Collection rate" value="86.3%" delta="+2.1%" hint="Term 2" accent="navy" />
        <KpiCard label="Bursaries awarded" value="360" delta="+24" hint="learners" accent="gold" />
        <KpiCard
          label="Audit events"
          value="12,904"
          delta="-4.5%"
          trend="down"
          hint="last 30 days"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Collections vs invoiced" description="KES millions by month">
          <div className="p-4">
            <CollectionsAreaChart data={[...revenueSeries]} />
          </div>
        </SectionCard>
        <SectionCard title="Collections by class" description="Collected vs outstanding (KES M)">
          <div className="p-4">
            <ComparisonBarChart
              data={[...collectionsByClass]}
              xKey="name"
              bars={[
                { key: "collected", color: "var(--color-teal)" },
                { key: "due", color: "var(--color-gold)" },
              ]}
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Discounts & bursaries" description="Active waivers across schools">
        <DataTable<DiscountRow>
          columns={discountColumns}
          rows={discounts}
          searchKeys={["name", "sponsor"]}
          searchPlaceholder="Search schemes…"
        />
      </SectionCard>

      <SectionCard title="Audit trail" description="Most recent privileged activity">
        <DataTable<AuditRow>
          columns={auditColumns}
          rows={auditLogs}
          searchKeys={["actor", "action", "target"]}
          searchPlaceholder="Search audit events…"
          pageSize={6}
        />
      </SectionCard>
    </>
  );
}
