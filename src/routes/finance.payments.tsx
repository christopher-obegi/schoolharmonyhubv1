import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { payments } from "@/lib/erp-data";

export const Route = createFileRoute("/finance/payments")({
  head: () => ({
    meta: [
      { title: "Payments & receipts — Scholaris ERP" },
      { name: "description", content: "Record payments, issue receipts and reconcile channels." },
      { property: "og:title", content: "Payments & receipts — Scholaris ERP" },
      {
        property: "og:description",
        content: "Record payments, issue receipts and reconcile channels.",
      },
    ],
  }),
  component: Page,
});

type Row = (typeof payments)[number];

const columns: Column<Row>[] = [
  { key: "id", header: "Payment", sortable: true },
  { key: "receipt", header: "Receipt" },
  { key: "student", header: "Student", sortable: true },
  { key: "method", header: "Method" },
  { key: "ref", header: "Reference" },
  { key: "date", header: "Date", sortable: true },
  { key: "amount", header: "Amount", align: "right" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage<Row>
      title="Payments & receipts"
      description="Record payments, issue receipts and reconcile channels."
      endpoint="POST /api/v1/payments"
      columns={columns}
      rows={payments}
      searchKeys={["id", "student", "ref"]}
      searchPlaceholder="Search payments…"
      filterKey="method"
      createLabel="Record payment"
      createFields={[
        { name: "student", label: "Student", type: "text", required: true, half: true },
        {
          name: "method",
          label: "Method",
          type: "select",
          required: true,
          half: true,
          options: ["M-Pesa", "Bank transfer", "Cheque", "Cash"],
        },
        { name: "amount", label: "Amount (KES)", type: "number", required: true, half: true },
        { name: "ref", label: "Reference", type: "text", required: true, half: true },
        { name: "date", label: "Payment date", type: "date", required: true, half: true },
      ]}
    />
  );
}
