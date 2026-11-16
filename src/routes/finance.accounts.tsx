import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { money, pageHead, shortDate, useList, useLookup } from "@/lib/resources";

const DESCRIPTION = "Ledger position per student: invoiced, paid, discounts and balance.";

export const Route = createFileRoute("/finance/accounts")({
  head: pageHead("Student accounts", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  student: string;
  invoiced: string;
  paid: string;
  discount: string;
  balance: string;
  balanceValue: number;
  lastPayment: string;
  status: string;
};

const columns: Column<Row>[] = [
  { key: "student", header: "Student", sortable: true },
  { key: "invoiced", header: "Invoiced", align: "right" },
  { key: "paid", header: "Paid", align: "right" },
  { key: "discount", header: "Discounts", align: "right" },
  { key: "balance", header: "Balance", align: "right", sortable: true, value: (row) => row.balanceValue },
  { key: "lastPayment", header: "Last payment" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function Page() {
  const { data, isLoading, error } = useList("studentAccounts");
  const students = useLookup("students");

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((a) => {
        const balance = Number(a.current_balance);
        return {
          id: a.id,
          student: students.name(a.student),
          invoiced: money(a.total_invoiced),
          paid: money(a.total_paid),
          discount: money(a.total_discount),
          balance: money(balance),
          balanceValue: balance,
          lastPayment: shortDate(a.last_payment_date),
          status: balance > 0 ? "In arrears" : "Cleared",
        };
      }),
    [data, students],
  );

  return (
    <ModulePage<Row>
      title="Student accounts"
      description={DESCRIPTION}
      resource="studentAccounts"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["student"]}
      searchPlaceholder="Search student accounts…"
      filterKey="status"
      emptyDescription="Accounts are maintained by the backend as invoices and payments are recorded."
    />
  );
}
