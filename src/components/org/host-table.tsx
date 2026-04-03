"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pencil, Power, PowerOff, Trash2, DoorOpen, Check, Plus, Minus, Search } from "lucide-react";
import { activateHost, deactivateHost, deleteHost, updateHost } from "@/app/actions/hosts";
import { formatRelativeTime } from "@/lib/utils";
import { getRoomsForUser, assignHost, unassignHost } from "@/app/actions/rooms";
import { HostForm } from "@/components/org/host-form";
import type { Host } from "@/lib/types/admin";
import type { RoomWithMembership } from "@/lib/types/room";

interface HostTableProps {
  hosts: Host[];
}

export function HostTable({ hosts }: HostTableProps) {
  const [isPending, startTransition] = useTransition();
  const [editingHost, setEditingHost] = useState<Host | null>(null);
  const [deletingHost, setDeletingHost] = useState<Host | null>(null);
  const [assigningHost, setAssigningHost] = useState<Host | null>(null);
  const [rooms, setRooms] = useState<RoomWithMembership[]>([]);
  const [roomSearch, setRoomSearch] = useState("");
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(new Set());
  const [originalMemberIds, setOriginalMemberIds] = useState<Set<string>>(new Set());

  function openAssignRooms(host: Host) {
    setAssigningHost(host);
    setRoomSearch("");
    getRoomsForUser(host.id).then(({ rooms: data }) => {
      setRooms(data);
      const memberIds = new Set(data.filter((r) => r.isMember).map((r) => r.id));
      setSelectedRoomIds(memberIds);
      setOriginalMemberIds(memberIds);
    });
  }

  function toggleRoom(roomId: string) {
    setSelectedRoomIds((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  }

  function handleAssignRooms() {
    if (!assigningHost) return;
    const toAdd = Array.from(selectedRoomIds).filter((id) => !originalMemberIds.has(id));
    const toRemove = Array.from(originalMemberIds).filter((id) => !selectedRoomIds.has(id));
    if (toAdd.length === 0 && toRemove.length === 0) {
      setAssigningHost(null);
      return;
    }
    startTransition(async () => {
      try {
        await Promise.all([
          ...toAdd.map((roomId) => assignHost(roomId, assigningHost.id)),
          ...toRemove.map((roomId) => unassignHost(roomId)),
        ]);
        const parts = [];
        if (toAdd.length > 0) parts.push(`added to ${toAdd.length} room(s)`);
        if (toRemove.length > 0) parts.push(`removed from ${toRemove.length} room(s)`);
        toast.success(`${assigningHost.name} ${parts.join(", ")}`);
        setAssigningHost(null);
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

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

  const columns: Column<Host>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (h) => <span className="font-medium">{h.name}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (h) => <span className="text-muted-foreground">{h.phone || "—"}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (h) => (
        <span className="text-muted-foreground">{h.email || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (h) => (
        <Badge variant={h.status === "approved" ? "default" : "secondary"}>
          {h.status === "approved" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "deviceName",
      header: "Device",
      render: (h) => (
        <span className="text-muted-foreground">{h.deviceName || "—"}</span>
      ),
    },
    {
      key: "lastSeenAt",
      header: "Last Seen",
      sortable: true,
      render: (h) => (
        <span className="text-muted-foreground">
          {formatRelativeTime(h.lastSeenAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-px whitespace-nowrap",
      render: (h) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditingHost(h)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openAssignRooms(h)}>
            <DoorOpen className="size-4" />
            Assign Rooms
          </Button>
          {h.status === "approved" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => deactivateHost(h.id), `${h.name} deactivated`)}
              disabled={isPending}
            >
              <PowerOff className="size-4" />
              Deactivate
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => activateHost(h.id), `${h.name} activated`)}
              disabled={isPending}
            >
              <Power className="size-4" />
              Activate
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeletingHost(h)}
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
        data={hosts}
        showSearch={false}
        searchPlaceholder="Search by name, phone, email..."
        searchFn={(h, q) => {
          const l = q.toLowerCase();
          return (
            h.name.toLowerCase().includes(l) ||
            (h.phone?.toLowerCase().includes(l) ?? false) ||
            (h.email?.toLowerCase().includes(l) ?? false)
          );
        }}
        pageSize={20}
        emptyMessage="No hosts found."
      />
      <AlertDialog open={deletingHost !== null} onOpenChange={(open) => !open && setDeletingHost(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingHost?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingHost) {
                  handleAction(() => deleteHost(deletingHost.id), `${deletingHost.name} deleted`);
                  setDeletingHost(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={assigningHost !== null} onOpenChange={(open) => !open && setAssigningHost(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Rooms — {assigningHost?.name}</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={roomSearch}
              onChange={(e) => setRoomSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Assigned rooms */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2 px-1">
                <h3 className="text-sm font-medium">Assigned</h3>
                <Badge variant="secondary" className="text-xs tabular-nums">
                  {rooms.filter((r) => selectedRoomIds.has(r.id)).length}
                </Badge>
              </div>
              <div className="min-h-48 max-h-72 overflow-y-auto space-y-1 rounded-lg border border-border bg-muted/30 p-2">
                {rooms
                  .filter((r) => selectedRoomIds.has(r.id) && r.name.toLowerCase().includes(roomSearch.toLowerCase()))
                  .map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleRoom(r.id)}
                      className="group w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors bg-primary/10 text-foreground hover:bg-destructive/10 hover:text-destructive border border-primary/20 hover:border-destructive/30 cursor-pointer"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Check className="size-3.5 shrink-0 text-primary group-hover:hidden" />
                        <Minus className="size-3.5 shrink-0 hidden group-hover:block" />
                        <span className="truncate">{r.name}</span>
                      </span>
                      {!originalMemberIds.has(r.id) && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0 ml-2">new</Badge>
                      )}
                    </button>
                  ))}
                {rooms.filter((r) => selectedRoomIds.has(r.id) && r.name.toLowerCase().includes(roomSearch.toLowerCase())).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No assigned rooms</p>
                )}
              </div>
            </div>
            {/* Available rooms */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2 px-1">
                <h3 className="text-sm font-medium">Available</h3>
                <Badge variant="secondary" className="text-xs tabular-nums">
                  {rooms.filter((r) => !selectedRoomIds.has(r.id)).length}
                </Badge>
              </div>
              <div className="min-h-48 max-h-72 overflow-y-auto space-y-1 rounded-lg border border-border bg-muted/30 p-2">
                {rooms
                  .filter((r) => !selectedRoomIds.has(r.id) && r.name.toLowerCase().includes(roomSearch.toLowerCase()))
                  .map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleRoom(r.id)}
                      className="group w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors hover:bg-primary/10 border border-transparent hover:border-primary/20 cursor-pointer"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Plus className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                        <span className="truncate">{r.name}</span>
                      </span>
                    </button>
                  ))}
                {rooms.filter((r) => !selectedRoomIds.has(r.id) && r.name.toLowerCase().includes(roomSearch.toLowerCase())).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No available rooms</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAssigningHost(null)}>Cancel</Button>
            <Button
              onClick={handleAssignRooms}
              disabled={isPending || (
                Array.from(selectedRoomIds).every((id) => originalMemberIds.has(id)) &&
                Array.from(originalMemberIds).every((id) => selectedRoomIds.has(id))
              )}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={editingHost !== null} onOpenChange={(open) => !open && setEditingHost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Host</DialogTitle>
          </DialogHeader>
          {editingHost && (
            <HostForm
              key={editingHost.id}
              action={updateHost.bind(null, editingHost.id)}
              defaultValues={{ name: editingHost.name, email: editingHost.email }}
              isEdit
              onClose={() => setEditingHost(null)}
              onSuccess={() => setEditingHost(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
