import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import { StatusBadge } from "@/components/erp/status-badge";
import { academicYears } from "@/lib/erp-data";

export const Route = createFileRoute("/academics/academic-years")({
  head: () => ({
    meta: [
      { title: "Academic years — Scholaris ERP" },
      { name: "description", content: "Open, activate and close academic years per school." },
      { property: "og:title", content: "Academic years — Scholaris ERP" },
      { property: "og:description", content: "Open, activate and close academic years per school." },
    ],
  }),
  component: Page,
});

const columns = [
    { key: "year", header: "Year", sortable: true },
    { key: "starts", header: "Starts" },
    { key: "ends", header: "Ends" },
    { key: "terms", header: "Terms", align: "right" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Academic years"
      description="Open, activate and close academic years per school."
      endpoint="GET /api/v1/academic-years"
      columns={columns}
      rows={academicYears}
      searchKeys={["year"]}
      searchPlaceholder="Search academic years…"
      createLabel="Add academic year"
      createFields={[
      {"name": "year", "label": "Year", "type": "text", "required": true, "half": true},
      {"name": "terms", "label": "Number of terms", "type": "number", "required": true, "half": true},
      {"name": "starts", "label": "Start date", "type": "date", "required": true, "half": true},
      {"name": "ends", "label": "End date", "type": "date", "required": true, "half": true},
      ]}
    />
  );
}
