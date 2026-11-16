import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { pageHead, payload, useCreate, useList, useLookup, useSchoolField } from "@/lib/resources";

const DESCRIPTION = "Stream capacity, enrolment and class teachers.";

export const Route = createFileRoute("/academics/streams")({
  head: pageHead("Streams", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  name: string;
  class: string;
  capacity: number;
  enrolled: number;
  teacher: string;
  status: string;
};

const columns: Column<Row>[] = [
  { key: "name", header: "Stream", sortable: true },
  { key: "class", header: "Class", sortable: true },
  { key: "capacity", header: "Capacity", align: "right" },
  { key: "enrolled", header: "Enrolled", sortable: true, align: "right" },
  { key: "teacher", header: "Class teacher" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function Page() {
  const { data, isLoading, error } = useList("streams");
  const students = useList("students");
  const create = useCreate("streams");
  const classes = useLookup("classes");
  const users = useLookup("users");
  const schoolField = useSchoolField();

  const rows = useMemo<Row[]>(() => {
    const enrolled = new Map<number, number>();
    for (const s of students.data ?? []) {
      const id = Number(s.current_stream);
      if (id) enrolled.set(id, (enrolled.get(id) ?? 0) + 1);
    }
    return (data ?? []).map((s) => {
      const count = enrolled.get(s.id) ?? 0;
      const capacity = Number(s.capacity ?? 0);
      return {
        id: s.id,
        name: String(s.name),
        class: classes.name(s.academic_class),
        capacity,
        enrolled: count,
        teacher: s.class_teacher ? users.name(s.class_teacher) : "Unassigned",
        status: !s.is_active ? "Inactive" : capacity && count >= capacity ? "Full" : "Active",
      };
    });
  }, [data, students.data, classes, users]);

  return (
    <ModulePage<Row>
      title="Streams"
      description={DESCRIPTION}
      resource="streams"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["name", "class", "teacher"]}
      searchPlaceholder="Search streams…"
      filterKey="class"
      createLabel="Add stream"
      onCreate={async (values) => {
        await create(payload(values, { numbers: ["capacity"] }));
      }}
      createFields={[
        schoolField,
        {
          name: "academic_class",
          label: "Class",
          type: "select",
          required: true,
          half: true,
          options: classes.options,
        },
        { name: "name", label: "Stream name", required: true, half: true, placeholder: "East" },
        {
          name: "capacity",
          label: "Capacity",
          type: "number",
          required: true,
          half: true,
          defaultValue: "30",
        },
        {
          name: "class_teacher",
          label: "Class teacher",
          type: "select",
          half: true,
          options: users.options,
        },
      ]}
    />
  );
}
