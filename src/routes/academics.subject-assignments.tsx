import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import { StatusBadge } from "@/components/erp/status-badge";
import { subjectAssignments } from "@/lib/erp-data";

export const Route = createFileRoute("/academics/subject-assignments")({
  head: () => ({
    meta: [
      { title: "Subject assignments — Scholaris ERP" },
      { name: "description", content: "Assign teachers to subjects per class and stream." },
      { property: "og:title", content: "Subject assignments — Scholaris ERP" },
      { property: "og:description", content: "Assign teachers to subjects per class and stream." },
    ],
  }),
  component: Page,
});

const columns = [
    { key: "subject", header: "Subject", sortable: true },
    { key: "class", header: "Class" },
    { key: "stream", header: "Stream" },
    { key: "teacher", header: "Teacher", sortable: true },
    { key: "lessons", header: "Lessons/week", align: "right" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Subject assignments"
      description="Assign teachers to subjects per class and stream."
      endpoint="GET /api/v1/subject-assignments"
      columns={columns}
      rows={subjectAssignments}
      searchKeys={["subject", "teacher", "class"]}
      searchPlaceholder="Search subject assignments…"
      filterKey="class"
      createLabel="Assign subject"
      createFields={[
      {"name": "subject", "label": "Subject", "type": "select", "required": true, "half": true, "options": ["Mathematics", "English", "Kiswahili", "Biology", "Chemistry", "History", "Computer Studies"]},
      {"name": "teacher", "label": "Teacher", "type": "text", "required": true, "half": true},
      {"name": "class", "label": "Class", "type": "select", "required": true, "half": true, "options": ["Form 1", "Form 2", "Form 3", "Form 4"]},
      {"name": "lessons", "label": "Lessons per week", "type": "number", "required": true, "half": true},
      ]}
    />
  );
}
