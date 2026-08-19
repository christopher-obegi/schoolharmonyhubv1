import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { students, type StudentRow } from "@/lib/erp-data";

export const Route = createFileRoute("/students/")({
  head: () => ({
    meta: [
      { title: "Student directory — Scholaris ERP" },
      { name: "description", content: "Admissions, learner profiles and class placement records." },
      { property: "og:title", content: "Student directory — Scholaris ERP" },
      {
        property: "og:description",
        content: "Admissions, learner profiles and class placement records.",
      },
    ],
  }),
  component: Page,
});

const columns: Column<StudentRow>[] = [
  { key: "adm", header: "Admission no.", sortable: true },
  { key: "name", header: "Student", sortable: true },
  { key: "class", header: "Class" },
  { key: "stream", header: "Stream" },
  { key: "guardian", header: "Guardian" },
  { key: "balance", header: "Balance", align: "right" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage<StudentRow>
      title="Student directory"
      description="Admissions, learner profiles and class placement records."
      endpoint="GET /api/v1/students"
      columns={columns}
      rows={students}
      searchKeys={["name", "adm", "guardian"]}
      searchPlaceholder="Search students…"
      filterKey="status"
      createLabel="Admit student"
      createFields={[
        { name: "name", label: "Full name", type: "text", required: true, half: true },
        { name: "adm", label: "Admission no.", type: "text", required: true, half: true },
        {
          name: "class",
          label: "Class",
          type: "select",
          required: true,
          half: true,
          options: ["Form 1", "Form 2", "Form 3", "Form 4"],
        },
        { name: "stream", label: "Stream", type: "text", half: true },
        { name: "guardian", label: "Primary guardian", type: "text", required: true, half: true },
        { name: "dob", label: "Date of birth", type: "date", half: true },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
      pageSize={8}
    />
  );
}
