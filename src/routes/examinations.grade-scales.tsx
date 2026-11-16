import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { pageHead, payload, useCreate, useList, useSchoolField } from "@/lib/resources";

const DESCRIPTION = "Score bands and remarks used to grade results.";

export const Route = createFileRoute("/examinations/grade-scales")({
  head: pageHead("Grade scales", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  grade: string;
  scale: string;
  from: number;
  to: number;
  remark: string;
  order: number;
};

const columns: Column<Row>[] = [
  { key: "grade", header: "Grade", sortable: true, value: (row) => row.order * 1000 - row.from },
  { key: "scale", header: "Scale" },
  { key: "from", header: "From", align: "right", sortable: true },
  { key: "to", header: "To", align: "right" },
  { key: "remark", header: "Remark" },
];

function Page() {
  const { data, isLoading, error } = useList("gradeScales");
  const create = useCreate("gradeScales");
  const schoolField = useSchoolField();

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((g) => ({
        id: g.id,
        grade: String(g.grade),
        scale: String(g.name),
        from: Number(g.minimum_mark),
        to: Number(g.maximum_mark),
        remark: String(g.remarks || "—"),
        order: Number(g.order ?? 0),
      })),
    [data],
  );

  return (
    <ModulePage<Row>
      title="Grade scales"
      description={DESCRIPTION}
      resource="gradeScales"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["grade", "scale", "remark"]}
      searchPlaceholder="Search grade scales…"
      filterKey="scale"
      createLabel="Add grade band"
      onCreate={async (values) => {
        await create(payload(values, { numbers: ["minimum_mark", "maximum_mark", "order"] }));
      }}
      createFields={[
        schoolField,
        { name: "name", label: "Scale name", required: true, half: true, placeholder: "KCSE 12-point" },
        { name: "grade", label: "Grade", required: true, half: true, placeholder: "A" },
        { name: "order", label: "Order", type: "number", half: true, defaultValue: "0" },
        { name: "minimum_mark", label: "From score", type: "number", required: true, half: true },
        { name: "maximum_mark", label: "To score", type: "number", required: true, half: true },
        { name: "remarks", label: "Remark", placeholder: "Excellent" },
      ]}
    />
  );
}
