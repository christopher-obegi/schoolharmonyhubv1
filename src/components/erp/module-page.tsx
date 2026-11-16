import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "./page-header";
import { DataTable, FilterChips, type Column } from "./data-table";
import { RecordDialog, type Field } from "./forms";
import { useCan, type Resource } from "@/lib/resources";

/**
 * Standard module screen: header + optional aside content + filterable data table
 * with a create action shown only to roles that may write this resource.
 */
export function ModulePage<T extends Record<string, unknown>>({
  title,
  description,
  resource,
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
  loading,
  error,
  onCreate,
  rowActions,
}: {
  title: string;
  description?: string | undefined;
  /** The API resource listed here: sets who may create. */
  resource: Resource;
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
  /** True while the rows are being fetched from the API. */
  loading?: boolean | undefined;
  /** A fetch error to show in place of the table. */
  error?: unknown;
  /** Persists a new record; throw to keep the dialog open and show the error. */
  onCreate?: ((values: Record<string, string>, files: Record<string, File>) => Promise<void>) | undefined;
  /** Per-row actions (buttons) shown at the end of each row. */
  rowActions?: ((row: T) => ReactNode) | undefined;
}) {
  const writable = useCan()(resource, true);
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
    writable && createFields && createLabel && onCreate ? (
      <RecordDialog
        trigger={
          <Button>
            <Plus className="mr-1 size-4" /> {createLabel}
          </Button>
        }
        title={createLabel}
        description="Changes are validated by the server before they are saved."
        fields={createFields}
        onSubmit={onCreate}
      />
    ) : null;

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            {extraActions}
            {createAction}
          </>
        }
      />
      {above}
      <SectionCard title={tableTitle ?? title} description={tableDescription}>
        {error ? (
          <div role="alert" className="flex items-start gap-3 p-6 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-foreground">Could not load {title.toLowerCase()}</p>
              <p className="mt-1 text-muted-foreground">
                {error instanceof Error ? error.message : String(error)}
              </p>
            </div>
          </div>
        ) : (
        <DataTable<T>
          loading={loading}
          rowActions={rowActions}
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
        )}
      </SectionCard>
      {below}
    </>
  );
}
