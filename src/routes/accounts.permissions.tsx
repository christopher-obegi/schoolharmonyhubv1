import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PageHeader, SectionCard } from "@/components/erp/page-header";
import { permissionGroups, roleRows } from "@/lib/erp-data";
import { useRole } from "@/components/erp/role-context";

export const Route = createFileRoute("/accounts/permissions")({
  head: () => ({
    meta: [
      { title: "Permissions — Scholaris ERP" },
      { name: "description", content: "Granular permission matrix mapped to each platform role." },
      { property: "og:title", content: "Permissions — Scholaris ERP" },
      {
        property: "og:description",
        content: "Granular permission matrix mapped to each platform role.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { writable } = useRole();

  return (
    <>
      <PageHeader
        title="Permissions"
        description="Granular permission matrix mapped to each platform role."
        endpoint="GET /api/v1/permissions"
      />

      <SectionCard title="Roles" description="Scope and assigned permission counts">
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {roleRows.map((role) => (
            <div key={role.id} className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{role.name}</p>
                <Badge variant="secondary">{role.scope}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {role.members.toLocaleString()} members · {role.permissions} permissions
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-2">
        {permissionGroups.map((group) => (
          <SectionCard
            key={group.module}
            title={group.module}
            description={`${group.items.length} permission scopes`}
          >
            <ul className="divide-y divide-border">
              {group.items.map((item, index) => (
                <li key={item} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <ShieldCheck className="size-4 shrink-0 text-teal" />
                    <code className="truncate font-mono text-xs text-foreground">{item}</code>
                  </div>
                  <Switch defaultChecked={index < group.items.length - 1} disabled={!writable} />
                </li>
              ))}
            </ul>
          </SectionCard>
        ))}
      </div>
    </>
  );
}
