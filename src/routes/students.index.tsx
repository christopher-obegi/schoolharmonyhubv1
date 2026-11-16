import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import {
  choices,
  humanize,
  pageHead,
  payload,
  shortDate,
  useCreate,
  useList,
  useLookup,
  useSchoolField,
} from "@/lib/resources";

const DESCRIPTION = "Admissions, learner profiles and class placement records.";

export const Route = createFileRoute("/students/")({
  head: pageHead("Student directory", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  adm: string;
  name: string;
  gender: string;
  class: string;
  stream: string;
  admitted: string;
  admittedRaw: string;
  status: string;
};

const columns: Column<Row>[] = [
  { key: "adm", header: "Admission no.", sortable: true },
  { key: "name", header: "Student", sortable: true },
  { key: "gender", header: "Gender" },
  { key: "class", header: "Class" },
  { key: "stream", header: "Stream" },
  { key: "admitted", header: "Admitted", sortable: true, value: (row) => row.admittedRaw },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function Page() {
  const { data, isLoading, error } = useList("students");
  const create = useCreate("students");
  const classes = useLookup("classes");
  const streams = useLookup("streams");
  const schoolField = useSchoolField();

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((s) => ({
        id: s.id,
        adm: String(s.admission_number),
        name: String(s.full_name ?? `${s.first_name} ${s.last_name}`),
        gender: humanize(s.gender),
        class: s.current_class ? classes.name(s.current_class) : "Unplaced",
        stream: s.current_stream ? streams.name(s.current_stream) : "—",
        admitted: shortDate(s.admission_date),
        admittedRaw: String(s.admission_date ?? ""),
        status: humanize(s.status),
      })),
    [data, classes, streams],
  );

  return (
    <ModulePage<Row>
      title="Student directory"
      description={DESCRIPTION}
      resource="students"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["name", "adm", "class"]}
      searchPlaceholder="Search students…"
      filterKey="status"
      pageSize={10}
      emptyTitle="No students yet"
      emptyDescription="Admit a student to create their record. Admission numbers are generated automatically."
      createLabel="Admit student"
      onCreate={async (values) => {
        await create(payload(values));
      }}
      createFields={[
        schoolField,
        { name: "first_name", label: "First name", required: true, half: true },
        { name: "middle_name", label: "Middle name", half: true },
        { name: "last_name", label: "Last name", required: true, half: true },
        {
          name: "gender",
          label: "Gender",
          type: "select",
          half: true,
          options: choices("MALE", "FEMALE", "OTHER", "NOT_SPECIFIED"),
          defaultValue: "NOT_SPECIFIED",
        },
        { name: "date_of_birth", label: "Date of birth", type: "date", half: true },
        { name: "current_class", label: "Class", type: "select", half: true, options: classes.options },
        { name: "current_stream", label: "Stream", type: "select", half: true, options: streams.options },
        { name: "phone_number", label: "Phone", half: true },
        { name: "email", label: "Email", type: "email", half: true },
        { name: "medical_conditions", label: "Medical notes", type: "textarea" },
      ]}
    />
  );
}
