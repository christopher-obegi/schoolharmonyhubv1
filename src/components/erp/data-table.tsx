import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Inbox, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EmptyState } from "./page-header";

export type Column<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "right";
  className?: string;
  render?: (row: T) => ReactNode;
  value?: (row: T) => string | number;
};

export function FilterChips({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  label?: string | undefined;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {label ? (
        <span className="mr-1 text-xs font-medium text-muted-foreground">{label}</span>
      ) : null}
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
            value === option
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  searchKeys = [],
  searchPlaceholder = "Search…",
  pageSize = 8,
  loading = false,
  toolbar,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Records will appear here once they are created.",
  emptyAction,
  rowActions,
}: {
  columns: Column<T>[];
  rows: T[];
  searchKeys?: string[] | undefined;
  searchPlaceholder?: string | undefined;
  pageSize?: number | undefined;
  loading?: boolean | undefined;
  toolbar?: ReactNode;
  emptyTitle?: string | undefined;
  emptyDescription?: string | undefined;
  emptyAction?: ReactNode;
  rowActions?: (row: T) => ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let data = rows;
    if (q && searchKeys.length) {
      data = data.filter((row) =>
        searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q)),
      );
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      data = [...data].sort((a, b) => {
        const av = col?.value ? col.value(a) : (a[sort.key] as string | number);
        const bv = col?.value ? col.value(b) : (b[sort.key] as string | number);
        if (typeof av === "number" && typeof bv === "number") {
          return sort.dir === "asc" ? av - bv : bv - av;
        }
        return sort.dir === "asc"
          ? String(av ?? "").localeCompare(String(bv ?? ""))
          : String(bv ?? "").localeCompare(String(av ?? ""));
      });
    }
    return data;
  }, [rows, query, sort, columns, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const paged = filtered.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (key: string) =>
    setSort((prev) =>
      prev?.key === key
        ? prev.dir === "asc"
          ? { key, dir: "desc" }
          : null
        : { key, dir: "asc" },
    );

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        {searchKeys.length ? (
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="bg-card pl-9"
            />
          </div>
        ) : (
          <div />
        )}
        {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "text-xs font-semibold tracking-wide text-muted-foreground uppercase",
                    col.align === "right" && "text-right",
                    col.className,
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {col.header}
                      {sort?.key === col.key ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3 opacity-50" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
              {rowActions ? <TableHead className="w-10" /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        <Skeleton className="h-4 w-full max-w-28" />
                      </TableCell>
                    ))}
                    {rowActions ? (
                      <TableCell>
                        <Skeleton className="h-4 w-6" />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              : paged.map((row, index) => (
                  <TableRow key={String(row["id"] ?? index)} className="hover:bg-accent/30">
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={cn(
                          "text-sm whitespace-nowrap",
                          col.align === "right" && "text-right",
                        )}
                      >
                        {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                      </TableCell>
                    ))}
                    {rowActions ? (
                      <TableCell className="text-right">{rowActions(row)}</TableCell>
                    ) : null}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {!loading && filtered.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
          icon={<Inbox className="size-5" />}
        />
      ) : null}

      {!loading && filtered.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, filtered.length)} of{" "}
            {filtered.length} records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {current} / {pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
