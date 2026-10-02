import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import {
  BOOLEAN_OPTIONS,
  activeStatus,
  choices,
  endpointLabel,
  humanize,
  pageHead,
  payload,
  useCreate,
  useList,
  useSchoolField,
} from "@/lib/resources";

const DESCRIPTION = "Subject catalogue by category, with teacher assignment counts.";

export const Route = createFileRoute("/academics/subjects")({
  head: pageHead("Subjects", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  code: string;
  name: string;
  shortName: string;
  category: string;
  type: string;
  teachers: number;
  status: string;
};

const columns: Column<Row>[] = [
  { key: "code", header: "Code", render: (row) => <span className="font-mono text-xs">{row.code}</span> },
  { key: "name", header: "Subject", sortable: true },
  { key: "shortName", header: "Short name" },
  { key: "category", header: "Category" },
  { key: "type", header: "Type" },
  { key: "teachers", header: "Teachers", align: "right" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function Page() {
  const { data, isLoading, error } = useList("subjects");
  const assignments = useList("subjectAssignments");
  const create = useCreate("subjects");
  const schoolField = useSchoolField();

  const rows = useMemo<Row[]>(() => {
    const teachers = new Map<number, Set<number>>();
    for (const a of assignments.data ?? []) {
      const subject = Number(a.subject);
      if (!teachers.has(subject)) teachers.set(subject, new Set());
      teachers.get(subject)!.add(Number(a.teacher));
    }
    return (data ?? []).map((s) => ({
      id: s.id,
      code: String(s.code),
      name: String(s.name),
      shortName: String(s.short_name || "—"),
      category: humanize(s.category),
      type: s.is_compulsory ? "Core" : "Elective",
      teachers: teachers.get(s.id)?.size ?? 0,
      status: activeStatus(s.is_active),
    }));
  }, [data, assignments.data]);

  return (
    <ModulePage<Row>
      title="Subjects"
      description={DESCRIPTION}
      resource="subjects"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["name", "code", "category"]}
      searchPlaceholder="Search subjects…"
      filterKey="category"
      createLabel="Add subject"
      onCreate={async (values) => {
        await create(payload(values, { booleans: ["is_compulsory"] }));
      }}
      createFields={[
        schoolField,
        { name: "name", label: "Subject name", required: true, half: true, placeholder: "Mathematics" },
        { name: "code", label: "Subject code", required: true, half: true, placeholder: "MAT", hint: "Unique across all schools" },
        { name: "short_name", label: "Short name", half: true, placeholder: "Maths" },
        {
          name: "category",
          label: "Category",
          type: "select",
          required: true,
          half: true,
          options: choices("LANGUAGES", "SCIENCES", "MATHEMATICS", "HUMANITIES", "TECHNICAL", "BUSINESS", "CREATIVE_ARTS", "SPORTS"),
        },
        { name: "is_compulsory", label: "Compulsory (core)", type: "select", half: true, options: BOOLEAN_OPTIONS, defaultValue: "true" },
        { name: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
