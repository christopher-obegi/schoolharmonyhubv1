import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, SectionCard } from "@/components/erp/page-header";
import { pageHead, useList } from "@/lib/resources";

const DESCRIPTION = "Permissions by module and the roles that hold them.";

export const Route = createFileRoute("/accounts/permissions")({
  head: pageHead("Permissions", DESCRIPTION),
  component: Page,
});

type Permission = { id: number; name: string; code: string; description: string; module: string };

function Page() {
  const roles = useList("roles");
  const permissions = useList<Permission>("permissions");

  const holders = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const role of roles.data ?? []) {
      for (const p of (role.permissions as Permission[] | undefined) ?? []) {
        map.set(p.code, [...(map.get(p.code) ?? []), String(role.name)]);
      }
    }
    return map;
  }, [roles.data]);

  const groups = useMemo(() => {
    const byModule = new Map<string, Permission[]>();
    for (const p of permissions.data ?? []) {
      byModule.set(p.module, [...(byModule.get(p.module) ?? []), p]);
    }
    return [...byModule.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [permissions.data]);

  const error = roles.error ?? permissions.error;

  return (
    <>
      <PageHeader title="Permissions" description={DESCRIPTION} />

      {error ? (
        <SectionCard title="Permissions">
          <p className="p-6 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Could not load permissions."}
          </p>
        </SectionCard>
      ) : null}

      <SectionCard title="Roles" description="Assigned permission counts">
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {roles.isLoading
            ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            : (roles.data ?? []).map((role) => (
                <div key={role.id} className="rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{String(role.name)}</p>
                    <Badge variant="secondary">{role.is_system_role ? "System" : "Custom"}</Badge>
                  </div>
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                    {String(role.code)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {((role.permissions as unknown[]) ?? []).length} permissions
                  </p>
                </div>
              ))}
          {!roles.isLoading && !roles.data?.length && !error ? (
            <p className="text-sm text-muted-foreground">No roles defined yet.</p>
          ) : null}
        </div>
      </SectionCard>

      {!permissions.isLoading && !groups.length && !error ? (
        <SectionCard title="Permission catalogue">
          <p className="p-6 text-sm text-muted-foreground">
            No permissions defined yet. They are created in the Django admin or by a data migration.
          </p>
        </SectionCard>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map(([module, items]) => (
          <SectionCard
            key={module}
            title={module}
            description={`${items.length} permission scopes`}
          >
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <ShieldCheck className="size-4 shrink-0 text-teal" />
                    <div className="min-w-0">
                      <code className="block truncate font-mono text-xs text-foreground">
                        {item.code}
                      </code>
                      <span className="text-[11px] text-muted-foreground">{item.name}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(holders.get(item.code) ?? []).map((roleName) => (
                      <Badge key={roleName} variant="outline" className="text-[10px]">
                        {roleName}
                      </Badge>
                    ))}
                    {!holders.get(item.code)?.length ? (
                      <span className="text-[11px] text-muted-foreground">Unassigned</span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        ))}
      </div>
    </>
  );
}
