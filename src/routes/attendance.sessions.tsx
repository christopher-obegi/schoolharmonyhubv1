import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import {
  choices,
  currentId,
  endpointLabel,
  humanize,
  pageHead,
  payload,
  shortDate,
  useCreate,
  useList,
  useLookup,
  useSchoolField,
} from "@/lib/resources";

const DESCRIPTION = "Open and close daily marking sessions per class and stream.";

export const Route = createFileRoute("/attendance/sessions")({
  head: pageHead("Attendance sessions", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  date: string;
  dateRaw: string;
  class: string;
  stream: string;
  period: string;
  teacher: string;
  marked: number;
  status: string;
};

const columns: Column<Row>[] = [
  { key: "date", header: "Date", sortable: true, value: (row) => row.dateRaw },
  { key: "class", header: "Class" },
  { key: "stream", header: "Stream" },
  { key: "period", header: "Period" },
  { key: "teacher", header: "Teacher" },
  { key: "marked", header: "Marked", align: "right" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function Page() {
  const { data, isLoading, error } = useList("attendanceSessions");
  const create = useCreate("attendanceSessions");
  const classes = useLookup("classes");
  const streams = useLookup("streams");
  const users = useLookup("users");
  const years = useLookup("academicYears");
  const terms = useLookup("terms");
  const schoolField = useSchoolField();

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((s) => ({
        id: s.id,
        date: shortDate(s.attendance_date),
        dateRaw: String(s.attendance_date),
        class: classes.name(s.class_field),
        stream: s.stream ? streams.name(s.stream) : "Whole class",
        period: humanize(s.session_type),
        teacher: s.teacher ? users.name(s.teacher) : "—",
        marked: Array.isArray(s.records) ? s.records.length : 0,
        status: humanize(s.status),
      })),
    [data, classes, streams, users],
  );

  return (
    <ModulePage<Row>
      title="Attendance sessions"
      description={DESCRIPTION}
      resource="attendanceSessions"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["class", "stream", "date", "teacher"]}
      searchPlaceholder="Search attendance sessions…"
      filterKey="status"
      createLabel="Open session"
      onCreate={async (values) => {
        await create(payload(values));
      }}
      createFields={[
        schoolField,
        { name: "attendance_date", label: "Date", type: "date", required: true, half: true, defaultValue: new Date().toISOString().slice(0, 10) },
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
        { name: "class_field", label: "Class", type: "select", required: true, half: true, options: classes.options },
        { name: "stream", label: "Stream", type: "select", half: true, options: streams.options },
        {
          name: "session_type",
          label: "Period",
          type: "select",
          required: true,
          half: true,
          options: choices("MORNING", "AFTERNOON", "EVENING", "FULL_DAY"),
          defaultValue: "MORNING",
        },
        { name: "teacher", label: "Teacher", type: "select", half: true, options: users.options },
        { name: "remarks", label: "Remarks", type: "textarea" },
      ]}
    />
  );
}
