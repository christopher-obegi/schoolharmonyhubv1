import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo } from "react";
import { Plus } from "lucide-react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { ConfirmDialog, RecordDialog } from "@/components/erp/forms";
import { api } from "@/lib/api";
import { useRole } from "@/components/erp/role-context";
import { Button } from "@/components/ui/button";
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
  useSchoolField,
} from "@/lib/resources";

const DESCRIPTION = "Exam windows, subjects and marking lifecycle.";

export const Route = createFileRoute("/examinations/exams")({
  head: pageHead("Exams & schedules", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  name: string;
  type: string;
  class: string;
  subject: string;
  term: string;
  starts: string;
  startRaw: string;
  ends: string;
  marks: string;
  status: string;
  published: boolean;
};

const columns: Column<Row>[] = [
  { key: "name", header: "Exam", sortable: true },
  { key: "type", header: "Type" },
  { key: "class", header: "Class" },
  { key: "subject", header: "Subject" },
  { key: "term", header: "Term" },
  { key: "starts", header: "Starts", sortable: true, value: (row) => row.startRaw },
  { key: "ends", header: "Ends" },
  { key: "marks", header: "Pass / total", align: "right" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function Page() {
  const { can } = useRole();
  const writable = can("exams", true);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useList("exams");
  const create = useCreate("exams");
  const createType = useCreate("examTypes");
  const examTypes = useLookup("examTypes");
  const classes = useLookup("classes");
  const streams = useLookup("streams");
  const subjects = useLookup("subjects");
  const years = useLookup("academicYears");
  const terms = useLookup("terms");
  const schoolField = useSchoolField();

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((e) => ({
        id: e.id,
        name: String(e.name),
        type: e.exam_type ? examTypes.name(e.exam_type) : humanize(e.assessment_type),
        class: classes.name(e.class_name),
        subject: subjects.name(e.subject),
        term: terms.name(e.term),
        starts: shortDate(e.start_date),
        startRaw: String(e.start_date ?? ""),
        ends: shortDate(e.end_date),
        marks: `${e.pass_mark} / ${e.total_marks}`,
        status: humanize(e.status),
        published: Boolean(e.is_published),
      })),
    [data, examTypes, classes, subjects, terms],
  );

  const addExamType =
    writable ? (
      <RecordDialog
        trigger={
          <Button variant="outline">
            <Plus className="mr-1 size-4" /> Add exam type
          </Button>
        }
        title="Add exam type"
        description="Exam types group exams, e.g. Opener, Mid-term, End-term."
        fields={[
          schoolField,
          { name: "name", label: "Name", required: true, half: true, placeholder: "End-Term Exam" },
          { name: "code", label: "Code", required: true, half: true, placeholder: "ENDTERM", hint: "Unique" },
          { name: "description", label: "Description", type: "textarea" },
        ]}
        onSubmit={async (values) => {
          await createType(payload(values));
        }}
      />
    ) : null;

  return (
    <ModulePage<Row>
      title="Exams & schedules"
      description={DESCRIPTION}
      resource="exams"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["name", "type", "class", "subject"]}
      searchPlaceholder="Search exams & schedules…"
      filterKey="status"
      extraActions={addExamType}
      rowActions={
        writable
          ? (row) =>
              row.published ? (
                <span className="text-xs text-muted-foreground">Published</span>
              ) : (
                <ConfirmDialog
                  trigger={
                    <Button variant="outline" size="sm">
                      Publish results
                    </Button>
                  }
                  title={`Publish results for ${row.name}?`}
                  description="Students and parents will be able to see these results. This cannot be undone from the app."
                  confirmLabel="Publish"
                  onConfirm={async () => {
                    try {
                      const res = await api<{ published: number }>(`/api/examinations/exams/${row.id}/publish/`, {
                        method: "POST",
                      });
                      toast.success(`Published ${res.published} result${res.published === 1 ? "" : "s"}`);
                      await queryClient.invalidateQueries({ queryKey: ["api", "exams"] });
                      await queryClient.invalidateQueries({ queryKey: ["api", "results"] });
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Could not publish results");
                    }
                  }}
                />
              )
          : undefined
      }
      createLabel="Schedule exam"
      onCreate={async (values) => {
        await create(payload(values, { numbers: ["total_marks", "pass_mark"] }));
      }}
      createFields={[
        { name: "name", label: "Exam name", required: true, placeholder: "Form 1 Mathematics End-Term" },
        schoolField,
        {
          name: "exam_type",
          label: "Exam type",
          type: "select",
          required: true,
          half: true,
          options: examTypes.options,
          hint: examTypes.options.length ? undefined : "Add an exam type first.",
        },
        {
          name: "assessment_type",
          label: "Assessment",
          type: "select",
          half: true,
          options: choices("CAT", "ASSIGNMENT", "PRACTICAL", "MIDTERM", "PROJECT", "END_TERM", "MOCK", "FINAL_EXAMINATION"),
          defaultValue: "END_TERM",
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
        { name: "term", label: "Term", type: "select", required: true, half: true, options: terms.options, defaultValue: currentId(terms.rows) },
        { name: "class_name", label: "Class", type: "select", required: true, half: true, options: classes.options },
        { name: "stream", label: "Stream", type: "select", half: true, options: streams.options },
        { name: "subject", label: "Subject", type: "select", required: true, half: true, options: subjects.options },
        { name: "code", label: "Code", half: true },
        { name: "total_marks", label: "Total marks", type: "number", half: true, defaultValue: "100" },
        { name: "pass_mark", label: "Pass mark", type: "number", half: true, defaultValue: "40" },
        { name: "start_date", label: "Start date", type: "date", half: true },
        { name: "end_date", label: "End date", type: "date", half: true },
      ]}
    />
  );
}
