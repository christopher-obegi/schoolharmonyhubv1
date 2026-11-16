import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import {
  choices,
  humanize,
  pageHead,
  payload,
  useCreate,
  useList,
  useSchoolField,
} from "@/lib/resources";

const DESCRIPTION = "Guardian contacts and relationships.";

export const Route = createFileRoute("/students/parents")({
  head: pageHead("Parents & guardians", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  name: string;
  relation: string;
  phone: string;
  email: string;
  occupation: string;
};

const columns: Column<Row>[] = [
  { key: "name", header: "Guardian", sortable: true },
  { key: "relation", header: "Relation" },
  {
    key: "phone",
    header: "Phone",
    render: (row) => <span className="font-mono text-xs">{row.phone}</span>,
  },
  { key: "email", header: "Email" },
  { key: "occupation", header: "Occupation" },
];

function Page() {
  const { data, isLoading, error } = useList("guardians");
  const create = useCreate("guardians");
  const schoolField = useSchoolField();

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((g) => ({
        id: g.id,
        name: `${g.first_name} ${g.last_name}`,
        relation: humanize(g.relationship),
        phone: String(g.phone_number || "—"),
        email: String(g.email || "—"),
        occupation: String(g.occupation || "—"),
      })),
    [data],
  );

  return (
    <ModulePage<Row>
      title="Parents & guardians"
      description={DESCRIPTION}
      resource="guardians"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["name", "phone", "email"]}
      searchPlaceholder="Search parents & guardians…"
      filterKey="relation"
      createLabel="Add guardian"
      onCreate={async (values) => {
        await create(payload(values));
      }}
      createFields={[
        schoolField,
        { name: "first_name", label: "First name", required: true, half: true },
        { name: "last_name", label: "Last name", required: true, half: true },
        {
          name: "relationship",
          label: "Relation",
          type: "select",
          required: true,
          half: true,
          options: choices("MOTHER", "FATHER", "GUARDIAN", "SPONSOR", "OTHER"),
          defaultValue: "GUARDIAN",
        },
        { name: "phone_number", label: "Phone", half: true, placeholder: "+254712345678" },
        { name: "email", label: "Email", type: "email", half: true },
        { name: "occupation", label: "Occupation", half: true },
        { name: "address", label: "Address", type: "textarea" },
      ]}
    />
  );
}
