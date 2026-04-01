"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { formatDate, formatDuration } from "@/lib/utils";
import type { Recording } from "@/lib/types/room";

interface RecordingTableProps {
  recordings: Recording[];
}

export function RecordingTable({ recordings }: RecordingTableProps) {
  const columns: Column<Recording>[] = [
    // {
    //   key: "session_id",
    //   header: "Session",
    //   render: (r) => (
    //     <span className="font-mono text-xs text-muted-foreground">
    //       {r.session_id.slice(0, 12)}...
    //     </span>
    //   ),
    // },
    {
      key: "filename",
      header: "File",
      render: (r) => (
        <span className="text-sm">{r.filename.slice(0, 14)}{r.filename.slice(57)}</span>
      ),
    },
    {
      key: "start_time",
      header: "Started",
      sortable: true,
      render: (r) => (
        <span className="text-muted-foreground">{formatDate(r.start_time)}</span>
      ),
    },
    {
      key: "end_time",
      header: "Ended",
      sortable: true,
      render: (r) =>
        r.end_time ? (
          <span className="text-muted-foreground">{formatDate(r.end_time)}</span>
        ) : (
          <Badge variant="default">Recording</Badge>
        ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (r) => {
        if (!r.start_time || !r.end_time) return <span className="text-muted-foreground">-</span>;
        const secs = Math.round(
          (new Date(r.end_time).getTime() - new Date(r.start_time).getTime()) / 1000
        );
        return <span className="text-muted-foreground">{formatDuration(secs)}</span>;
      },
    },
    {
      key: "player",
      header: "Play",
      render: (r) => (
        <audio controls preload="none" className="h-8 max-w-64">
          <source src={r.url} />
        </audio>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={recordings}
      showSearch={false}
      pageSize={20}
      emptyMessage="No recordings found."
    />
  );
}
