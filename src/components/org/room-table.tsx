"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  StopCircle,
  History,
  Play,
  Pause,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { deleteRoom, endRoom, activateRoom, deactivateRoom } from "@/app/actions/rooms";
import type { Room } from "@/lib/types/room";

export function RoomTable({ rooms }: { rooms: Room[] }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(action: () => Promise<void>, msg: string) {
    startTransition(async () => {
      try {
        await action();
        toast.success(msg);
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

  const columns: Column<Room>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <Link
          href={`/admin/rooms/${r.id}`}
          className="font-medium text-primary hover:underline"
        >
          {r.name}
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge
          variant={r.status === "active" ? "default" : "secondary"}
        >
          {r.status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (r) => (
        <span className="text-muted-foreground">{formatDate(r.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none">
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link
                href={`/admin/rooms/${r.id}`}
                className="flex items-center gap-2"
              >
                <Eye className="size-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`/admin/rooms/${r.id}/sessions`}
                className="flex items-center gap-2"
              >
                <History className="size-4" />
                Sessions
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {r.status === "inactive" && (
              <DropdownMenuItem
                onClick={() => handleAction(() => activateRoom(r.id), "Room activated")}
                disabled={isPending}
              >
                <Play className="size-4" />
                Activate
              </DropdownMenuItem>
            )}
            {r.status === "active" && (
              <DropdownMenuItem
                onClick={() => handleAction(() => deactivateRoom(r.id), "Room deactivated")}
                disabled={isPending}
              >
                <Pause className="size-4" />
                Deactivate
              </DropdownMenuItem>
            )}
            {r.status === "active" && (
              <DropdownMenuItem
                onClick={() => handleAction(() => endRoom(r.id), "Room ended")}
                disabled={isPending}
              >
                <StopCircle className="size-4" />
                End Room
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              variant="destructive"
              onClick={() =>
                handleAction(() => deleteRoom(r.id), "Room deleted")
              }
              disabled={isPending}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rooms}
      showSearch={false}
      emptyMessage="No rooms found."
    />
  );
}
