import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { pageHead, payload, useCreate, useList, useLookup } from "@/lib/resources";

const DESCRIPTION = "Enter subject scores per exam; percentage and grade are computed by the server.";

export const Route = createFileRoute("/examinations/marks")({
  head: pageHead("Marks entry", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  adm: string;
  name: string;
  exam: string;
  score: string;
  percentage: number;
  grade: string;
  remarks: string;
};

const columns: Column<Row>[] = [
  { key: "adm", header: "Admission no.", sortable: true },
  { key: "name", header: "Student", sortable: true },
  { key: "exam", header: "Exam" },
  { key: "score", header: "Score", align: "right" },
  { key: "percentage", header: "%", align: "right", sortable: true },
  { key: "grade", header: "Grade", align: "right" },
  { key: "remarks", header: "Remarks" },
];

function Page() {
  const { data, isLoading, error } = useList("marks");
  const create = useCreate("marks", ["results"]);
  const students = useLookup("students");
  const exams = useLookup("exams");

  const admissionNo = useMemo(
    () => new Map(students.rows.map((s) => [s.id, String(s.admission_number)])),
    [students.rows],
  );

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((m) => ({
        id: m.id,
        adm: admissionNo.get(Number(m.student)) ?? "—",
        name: students.name(m.student),
        exam: exams.name(m.exam),
        score: `${Number(m.marks_obtained)} / ${Number(m.total_marks)}`,
        percentage: Number(m.percentage),
        grade: String(m.grade || "—"),
        remarks: String(m.remarks || "—"),
      })),
    [data, students, exams, admissionNo],
  );

  return (
    <ModulePage<Row>
      title="Marks entry"
      description={DESCRIPTION}
      resource="marks"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["name", "adm", "exam"]}
      searchPlaceholder="Search learners…"
      filterKey="exam"
      tableTitle="Entered marks"
      createLabel="Add score"
      onCreate={async (values) => {
        await create(payload(values, { numbers: ["marks_obtained", "total_marks"] }));
      }}
      createFields={[
        { name: "exam", label: "Exam", type: "select", required: true, options: exams.options },
        { name: "student", label: "Student", type: "select", required: true, half: true, options: students.options },
        { name: "marks_obtained", label: "Score", type: "number", required: true, half: true },
        { name: "total_marks", label: "Out of", type: "number", half: true, defaultValue: "100" },
        { name: "remarks", label: "Teacher comment", type: "textarea" },
      ]}
    />
  );
}
