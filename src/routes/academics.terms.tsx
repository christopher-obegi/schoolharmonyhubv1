import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import {
  BOOLEAN_OPTIONS,
  currentId,
  pageHead,
  payload,
  shortDate,
  useCreate,
  useList,
  useLookup,
} from "@/lib/resources";

const DESCRIPTION = "Term calendars, durations and activation state.";

export const Route = createFileRoute("/academics/terms")({
  head: pageHead("Terms", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  name: string;
  number: number;
  year: string;
  starts: string;
  ends: string;
  startRaw: string;
  weeks: number | string;
  status: string;
};

const columns: Column<Row>[] = [
  { key: "name", header: "Term", sortable: true },
  { key: "number", header: "No.", align: "right" },
  { key: "year", header: "Academic year" },
  { key: "starts", header: "Starts", sortable: true, value: (row) => row.startRaw },
  { key: "ends", header: "Ends" },
  { key: "weeks", header: "Weeks", align: "right" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

const weeksBetween = (start: unknown, end: unknown) => {
  const ms = new Date(String(end)).getTime() - new Date(String(start)).getTime();
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / (7 * 24 * 3600 * 1000))) : "—";
};

function Page() {
  const { data, isLoading, error } = useList("terms");
  const create = useCreate("terms");
  const years = useLookup("academicYears");

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((t) => ({
        id: t.id,
        name: String(t.name),
        number: Number(t.number),
        year: years.name(t.academic_year),
        starts: shortDate(t.start_date),
        ends: shortDate(t.end_date),
        startRaw: String(t.start_date),
        weeks: weeksBetween(t.start_date, t.end_date),
        status: t.is_current ? "Current" : t.is_active ? "Active" : "Inactive",
      })),
    [data, years],
  );

  return (
    <ModulePage<Row>
      title="Terms"
      description={DESCRIPTION}
      resource="terms"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["name", "year"]}
      searchPlaceholder="Search terms…"
      filterKey="year"
      createLabel="Add term"
      onCreate={async (values) => {
        await create(payload(values, { numbers: ["number"], booleans: ["is_current", "is_active"] }));
      }}
      createFields={[
        {
          name: "academic_year",
          label: "Academic year",
          type: "select",
          required: true,
          half: true,
          options: years.options,
          defaultValue: currentId(years.rows),
        },
        { name: "name", label: "Term name", required: true, half: true, placeholder: "Term 1" },
        { name: "number", label: "Term number", type: "number", required: true, half: true, placeholder: "1" },
        { name: "is_current", label: "Current term", type: "select", half: true, options: BOOLEAN_OPTIONS, defaultValue: "false" },
        { name: "start_date", label: "Start date", type: "date", required: true, half: true },
        { name: "end_date", label: "End date", type: "date", required: true, half: true },
        { name: "is_active", label: "Active", type: "select", half: true, options: BOOLEAN_OPTIONS, defaultValue: "true" },
      ]}
    />
  );
}
