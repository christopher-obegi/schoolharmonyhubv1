import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import { StatusBadge } from "@/components/erp/status-badge";
import { exams } from "@/lib/erp-data";

export const Route = createFileRoute("/examinations/exams")({
  head: () => ({
    meta: [
      { title: "Exams & schedules — Scholaris ERP" },
      { name: "description", content: "Exam windows, subject counts and marking lifecycle." },
      { property: "og:title", content: "Exams & schedules — Scholaris ERP" },
      { property: "og:description", content: "Exam windows, subject counts and marking lifecycle." },
    ],
  }),
  component: Page,
});

const columns = [
    { key: "name", header: "Exam", sortable: true },
    { key: "type", header: "Type" },
    { key: "class", header: "Class" },
    { key: "starts", header: "Starts", sortable: true },
    { key: "ends", header: "Ends" },
    { key: "subjects", header: "Subjects", align: "right" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Exams & schedules"
      description="Exam windows, subject counts and marking lifecycle."
      endpoint="GET /api/v1/exams"
      columns={columns}
      rows={exams}
      searchKeys={["name", "type", "class"]}
      searchPlaceholder="Search exams & schedules…"
      filterKey="class"
      createLabel="Schedule exam"
      createFields={[
      {"name": "name", "label": "Exam name", "type": "text", "required": true, "half": false},
      {"name": "type", "label": "Exam type", "type": "select", "required": true, "half": true, "options": ["Opener Exam", "Mid-Term Exam", "End-Term Exam", "Mock Exam"]},
      {"name": "class", "label": "Class", "type": "select", "required": true, "half": true, "options": ["Form 1", "Form 2", "Form 3", "Form 4"]},
      {"name": "starts", "label": "Start date", "type": "date", "required": true, "half": true},
      {"name": "ends", "label": "End date", "type": "date", "required": true, "half": true},
      ]}
    />
  );
}
