"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/data-table";
import { PaginationNav } from "@/components/ui/pagination-nav";
import type { AttendanceRecord } from "@/app/actions/attendance";
import { formatDate } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface AttendanceTableProps {
  attendance: AttendanceRecord[];
  date: string;
  currentPage: number;
  totalPages: number;
  presentCount: number;
  totalCount: number;
}

export function AttendanceTable({
  attendance,
  date,
  currentPage,
  totalPages,
  presentCount,
  totalCount,
}: AttendanceTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPushedRef = useRef(searchParams.toString());

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? ""
  );
  const debouncedSearch = useDebounce(searchValue, 300);

  const pushParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);
      const qs = params.toString();
      if (qs === lastPushedRef.current) return;
      lastPushedRef.current = qs;
      router.push(`${pathname}?${qs}`);
    },
    [router, pathname, searchParams]
  );

  useEffect(() => {
    pushParams((params) => {
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      params.delete("page");
    });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleDateChange(newDate: string) {
    pushParams((params) => {
      params.set("date", newDate);
      params.delete("page");
    });
  }

  const absentCount = totalCount - presentCount;

  const columns: Column<AttendanceRecord>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (r) => (
        <Badge variant="outline" className="capitalize">
          {r.role}
        </Badge>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (r) => (
        <span className="text-muted-foreground">{r.phone || "—"}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (r) => (
        <span className="text-muted-foreground">{r.email || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) =>
        r.present ? (
          <Badge variant="default">Present</Badge>
        ) : (
          <Badge variant="secondary">Absent</Badge>
        ),
    },
    {
      key: "firstJoinAt",
      header: "First Joined",
      sortable: true,
      render: (r) => (
        <span className="text-muted-foreground">
          {r.firstJoinAt ? formatDate(r.firstJoinAt) : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-44"
          />
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, phone, email..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="default">{presentCount}</Badge> present
          <Badge variant="secondary" className="ml-1">
            {absentCount}
          </Badge>{" "}
          absent
        </div>
      </div>
      <DataTable
        columns={columns}
        data={attendance}
        showSearch={false}
        emptyMessage="No users or hosts found."
      />
      {totalPages > 1 && (
        <div className="flex justify-end">
          <PaginationNav currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
