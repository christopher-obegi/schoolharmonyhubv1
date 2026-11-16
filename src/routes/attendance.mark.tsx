import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import {
  choices,
  dateTime,
  humanize,
  pageHead,
  payload,
  shortDate,
  useCreate,
  useList,
  useLookup,
} from "@/lib/resources";

const DESCRIPTION = "Mark learner attendance against an open session.";

export const Route = createFileRoute("/attendance/mark")({
  head: pageHead("Mark attendance", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  adm: string;
  name: string;
  session: string;
  status: string;
  marked: string;
  note: string;
};

const columns: Column<Row>[] = [
  { key: "adm", header: "Admission no.", sortable: true },
  { key: "name", header: "Student", sortable: true },
  { key: "session", header: "Session" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  { key: "marked", header: "Marked at" },
  { key: "note", header: "Note" },
];

function Page() {
  const { data, isLoading, error } = useList("attendanceRecords");
  const sessions = useList("attendanceSessions");
  const create = useCreate("attendanceRecords", ["attendanceSessions"]);
  const students = useLookup("students");
  const classes = useLookup("classes");

  const sessionLabel = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of sessions.data ?? []) {
      map.set(s.id, `${shortDate(s.attendance_date)} · ${classes.name(s.class_field)} · ${humanize(s.session_type)}`);
    }
    return map;
  }, [sessions.data, classes]);

  const openSessions = useMemo(
    () =>
      (sessions.data ?? [])
        .filter((s) => s.status === "OPEN")
        .map((s) => ({ value: String(s.id), label: sessionLabel.get(s.id) ?? `#${s.id}` })),
    [sessions.data, sessionLabel],
  );

  const admissionNo = useMemo(
    () => new Map(students.rows.map((s) => [s.id, String(s.admission_number)])),
    [students.rows],
  );

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((r) => ({
        id: r.id,
        adm: admissionNo.get(Number(r.student)) ?? "—",
        name: students.name(r.student),
        session: sessionLabel.get(Number(r.attendance_session)) ?? `#${r.attendance_session}`,
        status: humanize(r.status),
        marked: dateTime(r.time_marked),
        note: String(r.remarks || "—"),
      })),
    [data, students, admissionNo, sessionLabel],
  );

  return (
    <ModulePage<Row>
      title="Mark attendance"
      description={DESCRIPTION}
      resource="attendanceRecords"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["name", "adm", "session"]}
      searchPlaceholder="Search learners…"
      filterKey="status"
      tableTitle="Attendance records"
      tableDescription="Each learner can be marked once per session."
      emptyDescription="Open a session under Attendance › Sessions, then mark learners here."
      createLabel="Mark learner"
      onCreate={async (values) => {
        await create(payload(values));
      }}
      createFields={[
        {
          name: "attendance_session",
          label: "Session",
          type: "select",
          required: true,
          options: openSessions,
          hint: openSessions.length ? undefined : "No open sessions. Open one under Attendance › Sessions.",
        },
        { name: "student", label: "Student", type: "select", required: true, half: true, options: students.options },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          half: true,
          options: choices("PRESENT", "LATE", "ABSENT", "EXCUSED"),
          defaultValue: "PRESENT",
        },
        { name: "remarks", label: "Note", type: "textarea" },
      ]}
    />
  );
}
