import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import {
  currentId,
  pageHead,
  payload,
  useCreate,
  useList,
  useLookup,
} from "@/lib/resources";

const DESCRIPTION = "Assign teachers to subjects per class, stream and term.";

export const Route = createFileRoute("/academics/subject-assignments")({
  head: pageHead("Subject assignments", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  subject: string;
  class: string;
  stream: string;
  teacher: string;
  year: string;
  term: string;
};

const columns: Column<Row>[] = [
  { key: "subject", header: "Subject", sortable: true },
  { key: "class", header: "Class", sortable: true },
  { key: "stream", header: "Stream" },
  { key: "teacher", header: "Teacher", sortable: true },
  { key: "year", header: "Year" },
  { key: "term", header: "Term" },
];

function Page() {
  const { data, isLoading, error } = useList("subjectAssignments");
  const create = useCreate("subjectAssignments", ["subjects"]);
  const subjects = useLookup("subjects");
  const classes = useLookup("classes");
  const streams = useLookup("streams");
  const users = useLookup("users");
  const years = useLookup("academicYears");
  const terms = useLookup("terms");

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((a) => ({
        id: a.id,
        subject: subjects.name(a.subject),
        class: classes.name(a.academic_class),
        stream: streams.name(a.stream),
        teacher: users.name(a.teacher),
        year: years.name(a.academic_year),
        term: terms.name(a.term),
      })),
    [data, subjects, classes, streams, users, years, terms],
  );

  return (
    <ModulePage<Row>
      title="Subject assignments"
      description={DESCRIPTION}
      resource="subjectAssignments"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["subject", "teacher", "class", "stream"]}
      searchPlaceholder="Search subject assignments…"
      filterKey="class"
      createLabel="Assign subject"
      onCreate={async (values) => {
        await create(payload(values));
      }}
      createFields={[
        { name: "subject", label: "Subject", type: "select", required: true, half: true, options: subjects.options },
        { name: "teacher", label: "Teacher", type: "select", required: true, half: true, options: users.options },
        { name: "academic_class", label: "Class", type: "select", required: true, half: true, options: classes.options },
        { name: "stream", label: "Stream", type: "select", required: true, half: true, options: streams.options },
        {
          name: "academic_year",
          label: "Academic year",
          type: "select",
          required: true,
          half: true,
          options: years.options,
          defaultValue: currentId(years.rows),
        },
        { name: "term", label: "Term", type: "select", required: true, half: true, options: terms.options, defaultValue: currentId(terms.rows) },
      ]}
    />
  );
}
