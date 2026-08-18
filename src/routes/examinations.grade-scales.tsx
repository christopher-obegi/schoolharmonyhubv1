import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { gradeScales } from "@/lib/erp-data";

export const Route = createFileRoute("/examinations/grade-scales")({
  head: () => ({
    meta: [
      { title: "Grade scales — Scholaris ERP" },
      { name: "description", content: "Score bands, points and remarks used to grade results." },
      { property: "og:title", content: "Grade scales — Scholaris ERP" },
      { property: "og:description", content: "Score bands, points and remarks used to grade results." },
    ],
  }),
  component: Page,
});

type Row = (typeof gradeScales)[number];

const columns: Column<Row>[] = [
    { key: "grade", header: "Grade", sortable: true },
    { key: "from", header: "From", align: "right" },
    { key: "to", header: "To", align: "right" },
    { key: "points", header: "Points", align: "right" },
    { key: "remark", header: "Remark" },
];

function Page() {
  return (
    <ModulePage
      title="Grade scales"
      description="Score bands, points and remarks used to grade results."
      endpoint="GET /api/v1/grade-scales"
      columns={columns}
      rows={gradeScales}
      searchKeys={["grade", "remark"]}
      searchPlaceholder="Search grade scales…"
      createLabel="Add grade band"
      createFields={[
      {"name": "grade", "label": "Grade", "type": "text", "required": true, "half": true},
      {"name": "points", "label": "Points", "type": "number", "required": true, "half": true},
      {"name": "from", "label": "From score", "type": "number", "required": true, "half": true},
      {"name": "to", "label": "To score", "type": "number", "required": true, "half": true},
      {"name": "remark", "label": "Remark", "type": "text", "required": false, "half": false},
      ]}
    />
  );
}
