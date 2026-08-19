import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { invoices } from "@/lib/erp-data";

export const Route = createFileRoute("/finance/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — Scholaris ERP" },
      { name: "description", content: "Issue, track and reconcile termly fee invoices." },
      { property: "og:title", content: "Invoices — Scholaris ERP" },
      { property: "og:description", content: "Issue, track and reconcile termly fee invoices." },
    ],
  }),
  component: Page,
});

type Row = (typeof invoices)[number];

const columns: Column<Row>[] = [
  { key: "id", header: "Invoice", sortable: true },
  { key: "student", header: "Student", sortable: true },
  { key: "class", header: "Class" },
  { key: "term", header: "Term" },
  { key: "due", header: "Due date", sortable: true },
  { key: "amount", header: "Amount", align: "right" },
  { key: "balance", header: "Balance", align: "right" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage<Row>
      title="Invoices"
      description="Issue, track and reconcile termly fee invoices."
      endpoint="GET /api/v1/invoices"
      columns={columns}
      rows={invoices}
      searchKeys={["id", "student", "class"]}
      searchPlaceholder="Search invoices…"
      filterKey="status"
      createLabel="Issue invoice"
      createFields={[
        { name: "student", label: "Student", type: "text", required: true, half: true },
        {
          name: "term",
          label: "Term",
          type: "select",
          required: true,
          half: true,
          options: ["Term 1", "Term 2", "Term 3"],
        },
        { name: "amount", label: "Amount (KES)", type: "number", required: true, half: true },
        { name: "due", label: "Due date", type: "date", required: true, half: true },
      ]}
    />
  );
}
