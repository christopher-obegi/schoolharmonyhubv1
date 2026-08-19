import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { SectionCard } from "@/components/erp/page-header";
import { ComparisonBarChart } from "@/components/erp/charts";
import { rankings, subjectPerformance } from "@/lib/erp-data";

export const Route = createFileRoute("/examinations/results")({
  head: () => ({
    meta: [
      { title: "Results & rankings — Scholaris ERP" },
      { name: "description", content: "Published results, class rankings and subject means." },
      { property: "og:title", content: "Results & rankings — Scholaris ERP" },
      { property: "og:description", content: "Published results, class rankings and subject means." },
    ],
  }),
  component: Page,
});

type Row = (typeof rankings)[number];

const columns: Column<Row>[] = [
  { key: "pos", header: "Pos.", sortable: true },
  { key: "name", header: "Student", sortable: true },
  { key: "class", header: "Class" },
  { key: "stream", header: "Stream" },
  { key: "total", header: "Total", align: "right", sortable: true },
  { key: "mean", header: "Mean", align: "right" },
  { key: "grade", header: "Grade", align: "right" },
  { key: "change", header: "Change", align: "right" },
];

function Page() {
  return (
    <ModulePage<Row>
      title="Results & rankings"
      description="Published results, class rankings and subject means."
      endpoint="GET /api/v1/exams/{id}/results"
      columns={columns}
      rows={rankings}
      searchKeys={["name", "class", "stream"]}
      searchPlaceholder="Search students…"
      filterKey="class"
      tableTitle="Merit list — Term 2 End-Term"
      above={
        <SectionCard title="Subject means" description="Average score per subject this exam">
          <div className="p-4">
            <ComparisonBarChart
              data={[...subjectPerformance]}
              xKey="subject"
              bars={[{ key: "mean", color: "var(--color-teal)" }]}
            />
          </div>
        </SectionCard>
      }
    />
  );
}
