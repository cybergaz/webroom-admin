"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchInput } from "@/components/ui/search-input";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { Spinner } from "@/components/ui/spinner";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  showSearch?: boolean;
  currentPage?: number;
  totalPages?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  actions?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  searchPlaceholder,
  showSearch = true,
  currentPage = 1,
  totalPages = 1,
  isLoading = false,
  emptyMessage = "No data found.",
  actions,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      {(showSearch || actions) && (
        <div className="flex items-center justify-between gap-4">
          {showSearch && (
            <div className="w-72">
              <SearchInput placeholder={searchPlaceholder} />
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
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
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
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

      {totalPages > 1 && (
        <div className="flex justify-end">
          <PaginationNav currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
