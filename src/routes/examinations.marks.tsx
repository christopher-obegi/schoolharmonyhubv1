import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { marksEntry } from "@/lib/erp-data";

export const Route = createFileRoute("/examinations/marks")({
  head: () => ({
    meta: [
      { title: "Marks entry — Scholaris ERP" },
      { name: "description", content: "Enter and validate subject scores before publishing." },
      { property: "og:title", content: "Marks entry — Scholaris ERP" },
      { property: "og:description", content: "Enter and validate subject scores before publishing." },
    ],
  }),
  component: Page,
});

type Row = (typeof marksEntry)[number];

const columns: Column<Row>[] = [
  { key: "adm", header: "Admission no.", sortable: true },
  { key: "name", header: "Student", sortable: true },
  { key: "score", header: "Score", align: "right", sortable: true },
  { key: "grade", header: "Grade", align: "right" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage<Row>
      title="Marks entry"
      description="Enter and validate subject scores before publishing."
      endpoint="POST /api/v1/exams/{id}/marks"
      columns={columns}
      rows={marksEntry}
      searchKeys={["name", "adm"]}
      searchPlaceholder="Search learners…"
      filterKey="status"
      tableTitle="Form 3 East — Mathematics, Term 2 End-Term"
      tableDescription="Scores are validated against the exam's maximum before submission."
      createLabel="Add score"
      createFields={[
        { name: "adm", label: "Admission no.", type: "text", required: true, half: true },
        { name: "score", label: "Score", type: "number", required: true, half: true },
        { name: "comment", label: "Teacher comment", type: "textarea" },
      ]}
    />
  );
}
