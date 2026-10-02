import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ModulePage } from "@/components/erp/module-page";
import type { Column } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { activeStatus, endpointLabel, pageHead, payload, useCreate, useList } from "@/lib/resources";

const DESCRIPTION = "Manage tenant schools, codes, contacts and activation status.";

export const Route = createFileRoute("/core/schools")({
  head: pageHead("Schools", DESCRIPTION),
  component: Page,
});

type Row = {
  id: number;
  name: string;
  code: string;
  registration: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  status: string;
};

const columns: Column<Row>[] = [
  { key: "name", header: "School", sortable: true },
  { key: "code", header: "Code", render: (row) => <span className="font-mono text-xs">{row.code}</span> },
  { key: "city", header: "City", sortable: true },
  { key: "country", header: "Country" },
  { key: "email", header: "Email" },
  { key: "phone", header: "Phone" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function Page() {
  const { data, isLoading, error } = useList("schools");
  const create = useCreate("schools");

  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((s) => ({
        id: s.id,
        name: String(s.name),
        code: String(s.code ?? ""),
        registration: String(s.registration_number ?? ""),
        city: String(s.city || "—"),
        country: String(s.country || "—"),
        email: String(s.email ?? ""),
        phone: String(s.phone_number ?? ""),
        status: activeStatus(s.is_active),
      })),
    [data],
  );

  return (
    <ModulePage<Row>
      title="Schools"
      description={DESCRIPTION}
      resource="schools"
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={error}
      searchKeys={["name", "code", "city", "email"]}
      searchPlaceholder="Search schools…"
      filterKey="status"
      emptyTitle="No schools yet"
      emptyDescription="Add the first school to start setting up classes, students and fees."
      createLabel="Add school"
      onCreate={async (values) => {
        await create(payload(values));
      }}
      createFields={[
        { name: "name", label: "School name", required: true },
        { name: "code", label: "School code", required: true, half: true },
        { name: "registration_number", label: "Registration number", required: true, half: true },
        { name: "email", label: "Contact email", type: "email", required: true, half: true },
        { name: "phone_number", label: "Phone number", required: true, half: true, placeholder: "+254712345678" },
        { name: "city", label: "City / town", half: true },
        { name: "country", label: "Country code", half: true, placeholder: "KE", hint: "Two-letter code" },
        { name: "address", label: "Address", type: "textarea" },
      ]}
    />
  );
}
