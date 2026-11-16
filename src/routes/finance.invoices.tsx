import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import {
  choices,
  currentId,
  humanize,
  money,
  pageHead,
  payload,
  shortDate,
  useCreate,
  useList,
  useLookup,
  useSchoolField,
} from "@/lib/resources";

const DESCRIPTION = "Issue, track and reconcile termly fee invoices.";

export const Route = createFileRoute("/finance/invoices")({
  head: pageHead("Invoices", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  number: string;
  student: string;
  term: string;
  issued: string;
  due: string;
  dueRaw: string;
  amount: string;
  balance: string;
  balanceValue: number;
  status: string;
};

const columns: Column<Row>[] = [
  {
    key: "number",
    header: "Invoice",
    sortable: true,
    render: (row) => <span className="font-mono text-xs">{row.number}</span>,
  },
  { key: "student", header: "Student", sortable: true },
  { key: "term", header: "Term" },
  { key: "issued", header: "Issued" },
  { key: "due", header: "Due date", sortable: true, value: (row) => row.dueRaw },
  { key: "amount", header: "Amount", align: "right" },
  {
    key: "balance",
    header: "Balance",
    align: "right",
    sortable: true,
    value: (row) => row.balanceValue,
  },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function Page() {
  const { data, isLoading, error } = useList("invoices");
  const create = useCreate("invoices", ["studentAccounts"]);
  const students = useLookup("students");
  const years = useLookup("academicYears");
  const terms = useLookup("terms");
  const schoolField = useSchoolField();

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((i) => ({
        id: i.id,
        number: String(i.invoice_number || `#${i.id}`),
        student: students.name(i.student),
        term: `${terms.name(i.term)} · ${years.name(i.academic_year)}`,
        issued: shortDate(i.issue_date),
        due: shortDate(i.due_date),
        dueRaw: String(i.due_date ?? ""),
        amount: money(i.total_amount),
        balance: money(i.balance),
        balanceValue: Number(i.balance),
        status: humanize(i.status),
      })),
    [data, students, years, terms],
  );

  return (
    <ModulePage<Row>
      title="Invoices"
      description={DESCRIPTION}
      resource="invoices"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["number", "student"]}
      searchPlaceholder="Search invoices…"
      filterKey="status"
      createLabel="Issue invoice"
      onCreate={async (values) => {
        await create(payload(values, { numbers: ["subtotal"] }));
      }}
      createFields={[
        schoolField,
        {
          name: "student",
          label: "Student",
          type: "select",
          required: true,
          half: true,
          options: students.options,
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
        {
          name: "term",
          label: "Term",
          type: "select",
          required: true,
          half: true,
          options: terms.options,
          defaultValue: currentId(terms.rows),
        },
        {
          name: "subtotal",
          label: "Amount (KES)",
          type: "number",
          required: true,
          half: true,
          hint: "Total and balance are computed from this.",
        },
        { name: "issue_date", label: "Issue date", type: "date", half: true },
        { name: "due_date", label: "Due date", type: "date", half: true },
        {
          name: "status",
          label: "Status",
          type: "select",
          half: true,
          options: choices("DRAFT", "ISSUED"),
          defaultValue: "DRAFT",
        },
        { name: "remarks", label: "Remarks", type: "textarea" },
      ]}
    />
  );
}
