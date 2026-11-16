import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import {
  BOOLEAN_OPTIONS,
  activeStatus,
  money,
  pageHead,
  payload,
  useCreate,
  useList,
  useSchoolField,
  yesNo,
} from "@/lib/resources";

const DESCRIPTION = "Fee categories and the fee structures priced against them.";

export const Route = createFileRoute("/finance/fees")({
  head: pageHead("Fees setup", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  name: string;
  code: string;
  mandatory: string;
  structures: number;
  amount: string;
  status: string;
};

const columns: Column<Row>[] = [
  { key: "name", header: "Category", sortable: true },
  { key: "code", header: "Code", render: (row) => <span className="font-mono text-xs">{row.code}</span> },
  { key: "mandatory", header: "Mandatory" },
  { key: "structures", header: "Structures", align: "right" },
  { key: "amount", header: "Amount range", align: "right" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function Page() {
  const { data, isLoading, error } = useList("feeCategories");
  const structures = useList("feeStructures");
  const create = useCreate("feeCategories");
  const schoolField = useSchoolField();

  const rows = useMemo<Row[]>(() => {
    const amounts = new Map<number, number[]>();
    for (const s of structures.data ?? []) {
      const category = Number(s.fee_category);
      amounts.set(category, [...(amounts.get(category) ?? []), Number(s.amount)]);
    }
    return (data ?? []).map((c) => {
      const values = amounts.get(c.id) ?? [];
      const low = Math.min(...values);
      const high = Math.max(...values);
      return {
        id: c.id,
        name: String(c.name),
        code: String(c.code),
        mandatory: yesNo(c.is_mandatory),
        structures: values.length,
        amount: !values.length ? "—" : low === high ? money(low) : `${money(low)} – ${money(high)}`,
        status: activeStatus(c.is_active),
      };
    });
  }, [data, structures.data]);

  return (
    <ModulePage<Row>
      title="Fees setup"
      description={DESCRIPTION}
      resource="feeCategories"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["name", "code"]}
      searchPlaceholder="Search fee categories…"
      filterKey="mandatory"
      createLabel="Add fee category"
      onCreate={async (values) => {
        await create(payload(values, { numbers: ["display_order"], booleans: ["is_mandatory"] }));
      }}
      createFields={[
        schoolField,
        { name: "name", label: "Category name", required: true, half: true, placeholder: "Tuition" },
        { name: "code", label: "Code", required: true, half: true, placeholder: "TUITION" },
        { name: "is_mandatory", label: "Mandatory", type: "select", half: true, options: BOOLEAN_OPTIONS, defaultValue: "true" },
        { name: "display_order", label: "Display order", type: "number", half: true, defaultValue: "0" },
        { name: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
