"use client";

import { useMemo, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { Spinner } from "@/components/ui/spinner";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  /** Enable click-to-sort on this column header. */
  sortable?: boolean;
  /** Extract a raw value for sorting. Defaults to `(row as any)[key]`. */
  getValue?: (row: T) => string | number | null | undefined;
}

type SortDir = "asc" | "desc";

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  /** Show URL-based SearchInput (server-side search). */
  showSearch?: boolean;
  /** Provide a function to enable client-side search. Shows a local search input. */
  searchFn?: (row: T, query: string) => boolean;
  /** Client-side page size. When set, enables client-side pagination. */
  pageSize?: number;
  /** Server-side pagination — current page. */
  currentPage?: number;
  /** Server-side pagination — total pages. */
  totalPages?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  actions?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  searchPlaceholder = "Search...",
  showSearch = true,
  searchFn,
  pageSize,
  currentPage = 1,
  totalPages = 1,
  isLoading = false,
  emptyMessage = "No data found.",
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [clientPage, setClientPage] = useState(1);

  // Toggle sort: click once = asc, again = desc, again = clear
  function handleSort(key: string) {
    if (sortKey === key) {
      if (sortDir === "asc") {
        setSortDir("desc");
      } else {
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setClientPage(1);
  }

  // Process data: search → sort → paginate (all client-side)
  const processed = useMemo(() => {
    let rows = data;

    // Client-side search
    if (searchFn && search) {
      rows = rows.filter((row) => searchFn(row, search));
    }

    // Sort
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.sortable) {
        const getValue =
          col.getValue ?? ((row: T) => (row as Record<string, any>)[col.key]);
        rows = [...rows].sort((a, b) => {
          const va = getValue(a);
          const vb = getValue(b);
          if (va == null && vb == null) return 0;
          if (va == null) return 1;
          if (vb == null) return -1;
          if (typeof va === "number" && typeof vb === "number") {
            return sortDir === "asc" ? va - vb : vb - va;
          }
          const sa = String(va).toLowerCase();
          const sb = String(vb).toLowerCase();
          const cmp = sa < sb ? -1 : sa > sb ? 1 : 0;
          return sortDir === "asc" ? cmp : -cmp;
        });
      }
    }

    return rows;
  }, [data, search, searchFn, sortKey, sortDir, columns]);

  // Client-side pagination
  const clientTotalPages = pageSize
    ? Math.ceil(processed.length / pageSize) || 1
    : 1;
  const displayData = pageSize
    ? processed.slice((clientPage - 1) * pageSize, clientPage * pageSize)
    : processed;

  // Reset client page when search changes results
  const effectiveClientPage = Math.min(clientPage, clientTotalPages);
  if (effectiveClientPage !== clientPage) {
    // Will be corrected on next render
    setTimeout(() => setClientPage(effectiveClientPage), 0);
  }

  function renderSortIcon(col: Column<T>) {
    if (!col.sortable) return null;
    if (sortKey !== col.key) {
      return <ArrowUpDown className="ml-1 inline size-3.5 text-muted-foreground/50" />;
    }
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline size-3.5" />
    ) : (
      <ArrowDown className="ml-1 inline size-3.5" />
    );
  }

  return (
    <div className="space-y-4">
      {(showSearch || searchFn || actions) && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {showSearch && !searchFn && (
              <div className="w-72">
                <SearchInput placeholder={searchPlaceholder} />
              </div>
            )}
            {searchFn && (
              <div className="relative w-72">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setClientPage(1);
                  }}
                  className="pl-8"
                />
              </div>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`${col.className ?? ""} ${col.sortable ? "cursor-pointer select-none" : ""}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  {col.header}
                  {renderSortIcon(col)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Spinner className="mx-auto" />
                </TableCell>
              </TableRow>
            ) : displayData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Client-side pagination */}
      {pageSize && clientTotalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {processed.length} result{processed.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClientPage((p) => Math.max(1, p - 1))}
              disabled={clientPage <= 1}
            >
              Previous
            </Button>
            <span className="px-3 text-sm text-muted-foreground">
              {clientPage} / {clientTotalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClientPage((p) => Math.min(clientTotalPages, p + 1))}
              disabled={clientPage >= clientTotalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Server-side pagination (existing) */}
      {!pageSize && totalPages > 1 && (
        <div className="flex justify-end">
          <PaginationNav currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
