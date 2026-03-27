"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Eye, Trash2, StopCircle, History, Play, Pause, Settings } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { deleteRoom, endRoom, activateRoom, deactivateRoom } from "@/app/actions/rooms";
import type { Room } from "@/lib/types/room";

export function RoomTable({ rooms }: { rooms: Room[]; }) {
  const [isPending, startTransition] = useTransition();
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);

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
        <Badge variant={r.status === "active" ? "default" : "secondary"}>
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
      header: "Actions",
      className: "w-px whitespace-nowrap",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/rooms/${r.id}`}>
              <Settings className="size-4" />
              Manage
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/rooms/${r.id}/sessions`}>
              <History className="size-4" />
              Sessions
            </Link>
          </Button>
          {r.status === "inactive" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => activateRoom(r.id), "Room activated")}
              disabled={isPending}
            >
              <Play className="size-4" />
              Activate
            </Button>
          )}
          {r.status === "active" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => deactivateRoom(r.id), "Room deactivated")}
              disabled={isPending}
            >
              <Pause className="size-4" />
              Deactivate
            </Button>
          )}
          {r.status === "active" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => endRoom(r.id), "Room ended")}
              disabled={isPending}
            >
              <StopCircle className="size-4" />
              End
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeletingRoom(r)}
            disabled={isPending}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={rooms}
        showSearch={false}
        emptyMessage="No rooms found."
      />
      <AlertDialog open={deletingRoom !== null} onOpenChange={(open) => !open && setDeletingRoom(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingRoom?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingRoom) {
                  handleAction(() => deleteRoom(deletingRoom.id), "Room deleted");
                  setDeletingRoom(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
