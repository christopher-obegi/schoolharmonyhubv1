import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import {
  choices,
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

const DESCRIPTION = "Record payments against invoices and reconcile channels.";

export const Route = createFileRoute("/finance/payments")({
  head: pageHead("Payments & receipts", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  reference: string;
  receipt: string;
  student: string;
  invoice: string;
  method: string;
  txn: string;
  date: string;
  dateRaw: string;
  amount: string;
  status: string;
};

const columns: Column<Row>[] = [
  { key: "reference", header: "Payment", sortable: true, render: (row) => <span className="font-mono text-xs">{row.reference}</span> },
  { key: "receipt", header: "Receipt" },
  { key: "student", header: "Student", sortable: true },
  { key: "invoice", header: "Invoice" },
  { key: "method", header: "Method" },
  { key: "txn", header: "Transaction ref." },
  { key: "date", header: "Date", sortable: true, value: (row) => row.dateRaw },
  { key: "amount", header: "Amount", align: "right" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function Page() {
  const { data, isLoading, error } = useList("payments");
  const receipts = useList("receipts");
  const create = useCreate("payments", ["invoices", "studentAccounts", "receipts"]);
  const students = useLookup("students");
  const invoices = useLookup("invoices");
  const schoolField = useSchoolField();

  const rows = useMemo<Row[]>(() => {
    const receiptFor = new Map((receipts.data ?? []).map((r) => [Number(r.payment), String(r.receipt_number)]));
    return (data ?? []).map((p) => ({
      id: p.id,
      reference: String(p.payment_reference || `#${p.id}`),
      receipt: receiptFor.get(p.id) ?? "—",
      student: students.name(p.student),
      invoice: invoices.name(p.invoice),
      method: humanize(p.payment_method),
      txn: String(p.transaction_reference || "—"),
      date: shortDate(p.payment_date),
      dateRaw: String(p.payment_date ?? ""),
      amount: money(p.amount),
      status: humanize(p.status),
    }));
  }, [data, receipts.data, students, invoices]);

  // Picking an invoice is enough to know the student; offer invoice labels with the student name.
  const invoiceOptions = useMemo(
    () =>
      invoices.rows.map((i) => ({
        value: String(i.id),
        label: `${i.invoice_number || `#${i.id}`} · ${students.name(i.student)} · bal. ${money(i.balance)}`,
      })),
    [invoices.rows, students],
  );

  return (
    <ModulePage<Row>
      title="Payments & receipts"
      description={DESCRIPTION}
      resource="payments"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["reference", "student", "txn"]}
      searchPlaceholder="Search payments…"
      filterKey="method"
      createLabel="Record payment"
      onCreate={async (values) => {
        const invoice = invoices.rows.find((i) => String(i.id) === values["invoice"]);
        await create({
          ...payload(values, { numbers: ["amount"] }),
          student: invoice?.student,
        });
      }}
      createFields={[
        schoolField,
        { name: "invoice", label: "Invoice", type: "select", required: true, half: true, options: invoiceOptions },
        {
          name: "payment_method",
          label: "Method",
          type: "select",
          required: true,
          half: true,
          options: choices("MOBILE_MONEY", "BANK_TRANSFER", "CHEQUE", "CASH", "CREDIT_CARD", "DEBIT_CARD", "ONLINE_PAYMENT"),
          defaultValue: "MOBILE_MONEY",
        },
        { name: "amount", label: "Amount (KES)", type: "number", required: true, half: true },
        { name: "transaction_reference", label: "Transaction reference", half: true, placeholder: "M-Pesa code" },
        { name: "payment_date", label: "Payment date", type: "date", half: true, defaultValue: new Date().toISOString().slice(0, 10) },
        {
          name: "status",
          label: "Status",
          type: "select",
          half: true,
          options: choices("PENDING", "SUCCESSFUL", "FAILED"),
          defaultValue: "SUCCESSFUL",
        },
        { name: "remarks", label: "Remarks", type: "textarea" },
      ]}
    />
  );
}
