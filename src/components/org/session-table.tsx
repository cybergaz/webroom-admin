"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { formatDate, formatDuration } from "@/lib/utils";
import type { RoomSession } from "@/lib/types/room";

interface SessionTableProps {
  sessions: RoomSession[];
  roomId?: string;
}

export function SessionTable({ sessions, roomId }: SessionTableProps) {
  const columns: Column<RoomSession>[] = [
    {
      key: "id",
      header: "Session",
      render: (s) => {
        const href = roomId
          ? `/admin/rooms/${roomId}/sessions/${s.id}`
          : `/admin/rooms/${s.roomId}/sessions/${s.id}`;
        return (
          <Link href={href} className="font-medium text-primary hover:underline">
            {s.id.slice(0, 8)}...
          </Link>
        );
      },
    },
    ...(roomId
      ? []
      : ([
          {
            key: "roomId",
            header: "Room",
            render: (s: RoomSession) => (
              <Link
                href={`/admin/rooms/${s.roomId}`}
                className="text-primary hover:underline"
              >
                {s.roomId.slice(0, 8)}...
              </Link>
            ),
          },
        ] as Column<RoomSession>[])),
    {
      key: "startedAt",
      header: "Started",
      render: (s) => (
        <span className="text-muted-foreground">{formatDate(s.startedAt)}</span>
      ),
    },
    {
      key: "endedAt",
      header: "Status",
      render: (s) =>
        s.endedAt ? (
          <span className="text-muted-foreground">{formatDate(s.endedAt)}</span>
        ) : (
          <Badge variant="default">Active</Badge>
        ),
    },
    {
      key: "speakingEvents",
      header: "Speaking Events",
      render: (s) => (
        <span className="text-muted-foreground">{s.speakingEvents.length}</span>
      ),
    },
    {
      key: "totalDuration",
      header: "Total Speaking",
      render: (s) => {
        const totalSecs = s.speakingEvents.reduce(
          (acc, e) => acc + (e.durationSeconds || 0),
          0
        );
        return (
          <span className="text-muted-foreground">
            {formatDuration(totalSecs)}
          </span>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={sessions}
      showSearch={false}
      emptyMessage="No sessions found."
    />
  );
}
