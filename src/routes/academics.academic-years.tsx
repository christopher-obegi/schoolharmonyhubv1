import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import {
  BOOLEAN_OPTIONS,
  endpointLabel,
  pageHead,
  payload,
  shortDate,
  useCreate,
  useList,
  useLookup,
  useSchoolField,
} from "@/lib/resources";

const DESCRIPTION = "Open, activate and close academic years per school.";

export const Route = createFileRoute("/academics/academic-years")({
  head: pageHead("Academic years", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  name: string;
  code: string;
  school: string;
  starts: string;
  ends: string;
  startRaw: string;
  terms: number;
  status: string;
};

const columns: Column<Row>[] = [
  { key: "name", header: "Year", sortable: true },
  { key: "code", header: "Code", render: (row) => <span className="font-mono text-xs">{row.code}</span> },
  { key: "school", header: "School" },
  { key: "starts", header: "Starts", sortable: true, value: (row) => row.startRaw },
  { key: "ends", header: "Ends" },
  { key: "terms", header: "Terms", align: "right" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function Page() {
  const { data, isLoading, error } = useList("academicYears");
  const terms = useList("terms");
  const create = useCreate("academicYears");
  const schools = useLookup("schools");
  const schoolField = useSchoolField();

  const rows = useMemo<Row[]>(() => {
    const termCount = new Map<number, number>();
    for (const t of terms.data ?? []) {
      const year = Number(t.academic_year);
      termCount.set(year, (termCount.get(year) ?? 0) + 1);
    }
    return (data ?? []).map((y) => ({
      id: y.id,
      name: String(y.name),
      code: String(y.code),
      school: schools.name(y.school),
      starts: shortDate(y.start_date),
      ends: shortDate(y.end_date),
      startRaw: String(y.start_date),
      terms: termCount.get(y.id) ?? 0,
      status: y.is_current ? "Current" : y.is_active ? "Active" : "Inactive",
    }));
  }, [data, terms.data, schools]);

  return (
    <ModulePage<Row>
      title="Academic years"
      description={DESCRIPTION}
      resource="academicYears"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["name", "code", "school"]}
      searchPlaceholder="Search academic years…"
      filterKey="status"
      createLabel="Add academic year"
      onCreate={async (values) => {
        await create(payload(values, { booleans: ["is_current", "is_active"] }));
      }}
      createFields={[
        schoolField,
        { name: "name", label: "Name", required: true, half: true, placeholder: "2026" },
        { name: "code", label: "Code", required: true, half: true, placeholder: "AY2026", hint: "Unique across all schools" },
        { name: "start_date", label: "Start date", type: "date", required: true, half: true },
        { name: "end_date", label: "End date", type: "date", required: true, half: true },
        { name: "is_current", label: "Current year", type: "select", half: true, options: BOOLEAN_OPTIONS, defaultValue: "false" },
        {
          name: "is_active",
          label: "Active",
          type: "select",
          half: true,
          options: BOOLEAN_OPTIONS,
          defaultValue: "false",
          hint: "Only one year per school can be active.",
        },
      ]}
    />
  );
}
