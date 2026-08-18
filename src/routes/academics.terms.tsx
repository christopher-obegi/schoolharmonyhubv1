import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import { StatusBadge } from "@/components/erp/status-badge";
import { terms } from "@/lib/erp-data";

export const Route = createFileRoute("/academics/terms")({
  head: () => ({
    meta: [
      { title: "Terms — Scholaris ERP" },
      { name: "description", content: "Term calendars, durations and activation state." },
      { property: "og:title", content: "Terms — Scholaris ERP" },
      { property: "og:description", content: "Term calendars, durations and activation state." },
    ],
  }),
  component: Page,
});

const columns = [
    { key: "name", header: "Term", sortable: true },
    { key: "year", header: "Year" },
    { key: "starts", header: "Starts" },
    { key: "ends", header: "Ends" },
    { key: "weeks", header: "Weeks", align: "right" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Terms"
      description="Term calendars, durations and activation state."
      endpoint="GET /api/v1/terms"
      columns={columns}
      rows={terms}
      searchKeys={["name", "year"]}
      searchPlaceholder="Search terms…"
      filterKey="year"
      createLabel="Add term"
      createFields={[
      {"name": "name", "label": "Term name", "type": "text", "required": true, "half": true},
      {"name": "year", "label": "Academic year", "type": "select", "required": true, "half": true, "options": ["2026", "2027"]},
      {"name": "starts", "label": "Start date", "type": "date", "required": true, "half": true},
      {"name": "ends", "label": "End date", "type": "date", "required": true, "half": true},
      ]}
    />
  );
}
