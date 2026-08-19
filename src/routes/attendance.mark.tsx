import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { attendanceRecords } from "@/lib/erp-data";

export const Route = createFileRoute("/attendance/mark")({
  head: () => ({
    meta: [
      { title: "Mark attendance — Scholaris ERP" },
      { name: "description", content: "Mark daily learner attendance per stream and period." },
      { property: "og:title", content: "Mark attendance — Scholaris ERP" },
      {
        property: "og:description",
        content: "Mark daily learner attendance per stream and period.",
      },
    ],
  }),
  component: Page,
});

type Row = (typeof attendanceRecords)[number];

const columns: Column<Row>[] = [
  { key: "adm", header: "Admission no.", sortable: true },
  { key: "name", header: "Student", sortable: true },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
  { key: "note", header: "Note" },
];

function Page() {
  return (
    <ModulePage<Row>
      title="Mark attendance"
      description="Mark daily learner attendance per stream and period."
      endpoint="POST /api/v1/attendance/records/bulk"
      columns={columns}
      rows={attendanceRecords}
      searchKeys={["name", "adm"]}
      searchPlaceholder="Search learners…"
      filterKey="status"
      createLabel="Add record"
      tableTitle="Form 3 East — Morning register"
      tableDescription="Statuses are saved per session and locked once the session closes."
      createFields={[
        { name: "adm", label: "Admission no.", type: "text", required: true, half: true },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          half: true,
          options: ["present", "late", "absent", "excused"],
        },
        { name: "note", label: "Note", type: "textarea" },
      ]}
    />
  );
}
