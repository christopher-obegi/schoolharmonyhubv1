import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import { StatusBadge } from "@/components/erp/status-badge";
import { feeCategories } from "@/lib/erp-data";

export const Route = createFileRoute("/finance/fees")({
  head: () => ({
    meta: [
      { title: "Fees setup — Scholaris ERP" },
      { name: "description", content: "Fee categories, structures and cadence per class." },
      { property: "og:title", content: "Fees setup — Scholaris ERP" },
      { property: "og:description", content: "Fee categories, structures and cadence per class." },
    ],
  }),
  component: Page,
});

const columns = [
    { key: "name", header: "Category", sortable: true },
    { key: "cadence", header: "Cadence" },
    { key: "mandatory", header: "Mandatory" },
    { key: "accounts", header: "Accounts", align: "right" },
    { key: "amount", header: "Amount", align: "right" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Fees setup"
      description="Fee categories, structures and cadence per class."
      endpoint="GET /api/v1/fee-categories"
      columns={columns}
      rows={feeCategories}
      searchKeys={["name", "cadence"]}
      searchPlaceholder="Search fees setup…"
      filterKey="cadence"
      createLabel="Add fee category"
      createFields={[
      {"name": "name", "label": "Category name", "type": "text", "required": true, "half": true},
      {"name": "cadence", "label": "Cadence", "type": "select", "required": true, "half": true, "options": ["Termly", "Yearly", "Monthly"]},
      {"name": "amount", "label": "Amount (KES)", "type": "number", "required": true, "half": true},
      {"name": "mandatory", "label": "Mandatory", "type": "select", "required": true, "half": true, "options": ["Yes", "No"]},
      ]}
    />
  );
}
