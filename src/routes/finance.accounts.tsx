import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import { StatusBadge } from "@/components/erp/status-badge";
import { studentAccounts } from "@/lib/erp-data";

export const Route = createFileRoute("/finance/accounts")({
  head: () => ({
    meta: [
      { title: "Student accounts — Scholaris ERP" },
      { name: "description", content: "Ledger position per student: invoiced, paid and balance." },
      { property: "og:title", content: "Student accounts — Scholaris ERP" },
      { property: "og:description", content: "Ledger position per student: invoiced, paid and balance." },
    ],
  }),
  component: Page,
});

const columns = [
    { key: "student", header: "Student", sortable: true },
    { key: "class", header: "Class" },
    { key: "invoiced", header: "Invoiced", align: "right" },
    { key: "paid", header: "Paid", align: "right" },
    { key: "balance", header: "Balance", align: "right" },
    { key: "plan", header: "Plan" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Student accounts"
      description="Ledger position per student: invoiced, paid and balance."
      endpoint="GET /api/v1/student-accounts"
      columns={columns}
      rows={studentAccounts}
      searchKeys={["student", "class", "plan"]}
      searchPlaceholder="Search student accounts…"
      filterKey="status"
    />
  );
}
