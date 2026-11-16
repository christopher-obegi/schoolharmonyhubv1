import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import {
  activeStatus,
  choices,
  humanize,
  pageHead,
  payload,
  useCreate,
  useList,
  useLookup,
  useSchoolField,
} from "@/lib/resources";

const DESCRIPTION = "Class levels, stream counts and enrolment per class.";

export const Route = createFileRoute("/academics/classes")({
  head: pageHead("Classes", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  name: string;
  code: string;
  level: string;
  school: string;
  streams: number;
  students: number;
  order: number;
  status: string;
};

const columns: Column<Row>[] = [
  { key: "name", header: "Class", sortable: true, value: (row) => row.order * 1000 + row.id },
  { key: "code", header: "Code", render: (row) => <span className="font-mono text-xs">{row.code}</span> },
  { key: "level", header: "Level" },
  { key: "school", header: "School" },
  { key: "streams", header: "Streams", align: "right" },
  { key: "students", header: "Students", sortable: true, align: "right" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function Page() {
  const { data, isLoading, error } = useList("classes");
  const streams = useList("streams");
  const students = useList("students");
  const create = useCreate("classes");
  const schools = useLookup("schools");
  const schoolField = useSchoolField();

  const rows = useMemo<Row[]>(() => {
    const count = (items: Record<string, unknown>[] | undefined, key: string) => {
      const map = new Map<number, number>();
      for (const item of items ?? []) {
        const id = Number(item[key]);
        if (id) map.set(id, (map.get(id) ?? 0) + 1);
      }
      return map;
    };
    const streamCount = count(streams.data, "academic_class");
    const studentCount = count(students.data, "current_class");
    return (data ?? []).map((c) => ({
      id: c.id,
      name: String(c.name),
      code: String(c.code),
      level: humanize(c.education_level),
      school: schools.name(c.school),
      streams: streamCount.get(c.id) ?? 0,
      students: studentCount.get(c.id) ?? 0,
      order: Number(c.display_order ?? 0),
      status: activeStatus(c.is_active),
    }));
  }, [data, streams.data, students.data, schools]);

  return (
    <ModulePage<Row>
      title="Classes"
      description={DESCRIPTION}
      resource="classes"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["name", "code", "level"]}
      searchPlaceholder="Search classes…"
      filterKey="level"
      createLabel="Add class"
      onCreate={async (values) => {
        await create(payload(values, { numbers: ["display_order"] }));
      }}
      createFields={[
        schoolField,
        { name: "name", label: "Class name", required: true, half: true, placeholder: "Form 1" },
        { name: "code", label: "Code", required: true, half: true, placeholder: "F1", hint: "Unique across all schools" },
        {
          name: "education_level",
          label: "Education level",
          type: "select",
          required: true,
          half: true,
          options: choices("PRIMARY", "JUNIOR_SECONDARY", "SENIOR_SECONDARY", "COLLEGE", "UNIVERSITY"),
        },
        { name: "display_order", label: "Display order", type: "number", half: true, defaultValue: "0" },
        { name: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
