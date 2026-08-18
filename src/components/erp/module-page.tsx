import { useMemo, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "./page-header";
import { DataTable, FilterChips, type Column } from "./data-table";
import { RecordDialog, type Field } from "./forms";
import { useRole } from "./role-context";

/**
 * Standard module screen: header + optional aside content + filterable data table
 * with a role-aware create action.
 */
export function ModulePage<T extends Record<string, unknown>>({
  title,
  description,
  endpoint,
  columns,
  rows,
  searchKeys,
  searchPlaceholder,
  filterKey,
  createLabel,
  createFields,
  tableTitle,
  tableDescription,
  above,
  below,
  extraActions,
  emptyTitle,
  emptyDescription,
  pageSize,
}: {
  title: string;
  description?: string | undefined;
  endpoint?: string | undefined;
  columns: Column<T>[];
  rows: T[];
  searchKeys?: string[] | undefined;
  searchPlaceholder?: string | undefined;
  filterKey?: (keyof T & string) | undefined;
  createLabel?: string | undefined;
  createFields?: Field[] | undefined;
  tableTitle?: string | undefined;
  tableDescription?: string | undefined;
  above?: ReactNode;
  below?: ReactNode;
  extraActions?: ReactNode;
  emptyTitle?: string | undefined;
  emptyDescription?: string | undefined;
  pageSize?: number | undefined;
}) {
  const { writable } = useRole();
  const [filter, setFilter] = useState("all");

  const filterOptions = useMemo(() => {
    if (!filterKey) return [];
    return ["all", ...Array.from(new Set(rows.map((row) => String(row[filterKey]))))];
  }, [filterKey, rows]);

  const visible = useMemo(() => {
    if (!filterKey || filter === "all") return rows;
    return rows.filter((row) => String(row[filterKey]) === filter);
  }, [rows, filter, filterKey]);

  const createAction =
    writable && createFields && createLabel ? (
      <RecordDialog
        trigger={
          <Button>
            <Plus className="mr-1 size-4" /> {createLabel}
          </Button>
        }
        title={createLabel}
        description="Changes are validated before they are submitted to the API."
        fields={createFields}
        onSubmit={() => toast.success(`${createLabel} submitted`)}
      />
    ) : null;

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        endpoint={endpoint}
        actions={
          <>
            {extraActions}
            {createAction}
          </>
        }
      />
      {above}
      <SectionCard title={tableTitle ?? title} description={tableDescription}>
        <DataTable<T>
          columns={columns}
          rows={visible}
          searchKeys={searchKeys}
          searchPlaceholder={searchPlaceholder}
          pageSize={pageSize}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          toolbar={
            filterKey && filterOptions.length > 2 ? (
              <FilterChips
                label="Filter"
                options={filterOptions}
                value={filter}
                onChange={setFilter}
              />
            ) : null
          }
        />
      </SectionCard>
      {below}
    </>
  );
}
