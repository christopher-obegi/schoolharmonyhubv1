import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import {
  choices,
  currentId,
  humanize,
  pageHead,
  payload,
  shortDate,
  useCreate,
  useList,
  useLookup,
} from "@/lib/resources";

const DESCRIPTION = "Year-on-year enrolment, promotion and transfer records.";

export const Route = createFileRoute("/students/enrollments")({
  head: pageHead("Enrollments", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  student: string;
  year: string;
  term: string;
  class: string;
  stream: string;
  date: string;
  dateRaw: string;
  status: string;
};

const columns: Column<Row>[] = [
  { key: "student", header: "Student", sortable: true },
  { key: "year", header: "Year" },
  { key: "term", header: "Term" },
  { key: "class", header: "Class" },
  { key: "stream", header: "Stream" },
  { key: "date", header: "Date", sortable: true, value: (row) => row.dateRaw },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function Page() {
  const { data, isLoading, error } = useList("enrollments");
  const create = useCreate("enrollments");
  const students = useLookup("students");
  const years = useLookup("academicYears");
  const terms = useLookup("terms");
  const classes = useLookup("classes");
  const streams = useLookup("streams");

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((e) => ({
        id: e.id,
        student: students.name(e.student),
        year: years.name(e.academic_year),
        term: terms.name(e.term),
        class: classes.name(e.class_field),
        stream: streams.name(e.stream),
        date: shortDate(e.enrollment_date),
        dateRaw: String(e.enrollment_date ?? ""),
        status: humanize(e.status),
      })),
    [data, students, years, terms, classes, streams],
  );

  return (
    <ModulePage<Row>
      title="Enrollments"
      description={DESCRIPTION}
      resource="enrollments"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["student", "class", "stream"]}
      searchPlaceholder="Search enrollments…"
      filterKey="year"
      createLabel="New enrollment"
      onCreate={async (values) => {
        await create(payload(values));
      }}
      createFields={[
        {
          name: "student",
          label: "Student",
          type: "select",
          required: true,
          options: students.options,
        },
        {
          name: "academic_year",
          label: "Academic year",
          type: "select",
          required: true,
          half: true,
          options: years.options,
          defaultValue: currentId(years.rows),
        },
        {
          name: "term",
          label: "Term",
          type: "select",
          required: true,
          half: true,
          options: terms.options,
          defaultValue: currentId(terms.rows),
        },
        {
          name: "class_field",
          label: "Class",
          type: "select",
          required: true,
          half: true,
          options: classes.options,
        },
        {
          name: "stream",
          label: "Stream",
          type: "select",
          required: true,
          half: true,
          options: streams.options,
        },
        { name: "enrollment_date", label: "Enrollment date", type: "date", half: true },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          half: true,
          options: choices("ACTIVE", "PROMOTED", "TRANSFERRED", "COMPLETED"),
          defaultValue: "ACTIVE",
        },
      ]}
    />
  );
}
