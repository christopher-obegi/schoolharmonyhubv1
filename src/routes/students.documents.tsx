import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { choices, dateTime, humanize, pageHead, useCreate, useList, useLookup } from "@/lib/resources";

const DESCRIPTION = "Uploaded certificates, reports and identity documents per student.";

export const Route = createFileRoute("/students/documents")({
  head: pageHead("Student documents", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  student: string;
  type: string;
  file: string;
  url: string;
  uploaded: string;
  uploadedRaw: string;
};

const columns: Column<Row>[] = [
  { key: "student", header: "Student", sortable: true },
  { key: "type", header: "Document type" },
  {
    key: "file",
    header: "File",
    render: (row) =>
      row.url ? (
        <a href={row.url} target="_blank" rel="noreferrer" className="font-mono text-xs text-primary hover:underline">
          {row.file}
        </a>
      ) : (
        <span className="font-mono text-xs">{row.file}</span>
      ),
  },
  { key: "uploaded", header: "Uploaded", sortable: true, value: (row) => row.uploadedRaw },
];

function Page() {
  const { data, isLoading, error } = useList("documents");
  const students = useLookup("students");
  const create = useCreate("documents");

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((d) => {
        const url = String(d.file ?? "");
        return {
          id: d.id,
          student: students.name(d.student),
          type: humanize(d.document_type),
          file: url.split("/").pop() || "—",
          url,
          uploaded: dateTime(d.uploaded_at),
          uploadedRaw: String(d.uploaded_at ?? ""),
        };
      }),
    [data, students],
  );

  return (
    <ModulePage<Row>
      title="Student documents"
      description={DESCRIPTION}
      resource="documents"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["student", "type", "file"]}
      searchPlaceholder="Search student documents…"
      filterKey="type"
      emptyTitle="No documents uploaded"
      emptyDescription="Upload a birth certificate, report card or other record for a student."
      createLabel="Upload document"
      onCreate={async (values, files) => {
        const form = new FormData();
        form.append("student", values["student"] ?? "");
        form.append("document_type", values["document_type"] ?? "");
        if (files["file"]) form.append("file", files["file"]);
        await create(form);
      }}
      createFields={[
        { name: "student", label: "Student", type: "select", required: true, options: students.options },
        {
          name: "document_type",
          label: "Document type",
          type: "select",
          required: true,
          half: true,
          options: choices(
            "BIRTH_CERTIFICATE",
            "PASSPORT",
            "NATIONAL_ID",
            "MEDICAL_RECORD",
            "REPORT_CARD",
            "TRANSFER_LETTER",
            "ADMISSION_LETTER",
          ),
        },
        { name: "file", label: "File", type: "file", required: true, half: true },
      ]}
    />
  );
}
