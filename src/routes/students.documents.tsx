import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import { StatusBadge } from "@/components/erp/status-badge";
import { studentDocuments } from "@/lib/erp-data";

export const Route = createFileRoute("/students/documents")({
  head: () => ({
    meta: [
      { title: "Student documents — Scholaris ERP" },
      { name: "description", content: "Uploaded certificates, result slips and verification status." },
      { property: "og:title", content: "Student documents — Scholaris ERP" },
      { property: "og:description", content: "Uploaded certificates, result slips and verification status." },
    ],
  }),
  component: Page,
});

const columns = [
    { key: "student", header: "Student", sortable: true },
    { key: "type", header: "Document type" },
    { key: "file", header: "File", render: (row) => <span className="font-mono text-xs">{String(row.file)}</span> },
    { key: "size", header: "Size", align: "right" },
    { key: "uploaded", header: "Uploaded", sortable: true },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Student documents"
      description="Uploaded certificates, result slips and verification status."
      endpoint="GET /api/v1/students/:id/documents"
      columns={columns}
      rows={studentDocuments}
      searchKeys={["student", "type", "file"]}
      searchPlaceholder="Search student documents…"
      filterKey="type"
      createLabel="Upload document"
      createFields={[
      {"name": "student", "label": "Student", "type": "text", "required": true, "half": true},
      {"name": "type", "label": "Document type", "type": "select", "required": true, "half": true, "options": ["Birth certificate", "KCPE result slip", "Transfer letter", "Medical report"]},
      {"name": "file", "label": "File name", "type": "text", "required": true, "half": true},
      {"name": "notes", "label": "Notes", "type": "textarea", "required": false, "half": false},
      ]}
    />
  );
}
