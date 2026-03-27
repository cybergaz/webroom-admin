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
import { Pencil, Power, PowerOff, Trash2, DoorOpen, Check } from "lucide-react";
import {
  activateUser,
  deactivateUser,
  deleteUser,
  updateUser,
} from "@/app/actions/users";
import { getRoomsForUser, assignUserToRooms, removeMember } from "@/app/actions/rooms";
import { UserEditForm } from "@/components/org/user-edit-form";
import type { ManagedUser } from "@/lib/types/admin";
import type { RoomWithMembership } from "@/lib/types/room";
import { formatDate } from "@/lib/utils";

function statusBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge variant="default">Active</Badge>;
    case "pending_approval":
      return <Badge variant="secondary">Pending</Badge>;
    case "rejected":
      return <Badge variant="outline">Inactive</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

interface UserTableProps {
  users: ManagedUser[];
}

export function UserTable({ users }: UserTableProps) {
  const [isPending, startTransition] = useTransition();
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null);
  const [assigningUser, setAssigningUser] = useState<ManagedUser | null>(null);
  const [rooms, setRooms] = useState<RoomWithMembership[]>([]);
  const [roomSearch, setRoomSearch] = useState("");
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(new Set());
  const [originalMemberIds, setOriginalMemberIds] = useState<Set<string>>(new Set());

  function openAssignRooms(user: ManagedUser) {
    setAssigningUser(user);
    setRoomSearch("");
    getRoomsForUser(user.id).then(({ rooms: data }) => {
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
    if (!assigningUser) return;
    const toAdd = Array.from(selectedRoomIds).filter((id) => !originalMemberIds.has(id));
    const toRemove = Array.from(originalMemberIds).filter((id) => !selectedRoomIds.has(id));
    if (toAdd.length === 0 && toRemove.length === 0) {
      setAssigningUser(null);
      return;
    }
    startTransition(async () => {
      try {
        await Promise.all([
          toAdd.length > 0 ? assignUserToRooms(assigningUser.id, toAdd) : Promise.resolve(),
          ...toRemove.map((roomId) => removeMember(roomId, assigningUser.id)),
        ]);
        const parts = [];
        if (toAdd.length > 0) parts.push(`added to ${toAdd.length} room(s)`);
        if (toRemove.length > 0) parts.push(`removed from ${toRemove.length} room(s)`);
        toast.success(`${assigningUser.name} ${parts.join(", ")}`);
        setAssigningUser(null);
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

  function handleAction(action: () => Promise<void>, successMsg: string) {
    startTransition(async () => {
      try {
        await action();
        toast.success(successMsg);
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

  const columns: Column<ManagedUser>[] = [
    {
      key: "name",
      header: "Name",
      render: (u) => <span className="font-medium">{u.name}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (u) => <span className="text-muted-foreground">{u.phone || "—"}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (u) => (
        <span className="text-muted-foreground">{u.email || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) => statusBadge(u.status),
    },
    {
      key: "requestId",
      header: "User Code",
      render: (u) => statusBadge(u.requestId),
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (u) => (
        <span className="text-muted-foreground">{formatDate(u.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-px whitespace-nowrap",
      render: (u) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditingUser(u)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openAssignRooms(u)}>
            <DoorOpen className="size-4" />
            Assign Rooms
          </Button>
          {u.status === "approved" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => deactivateUser(u.id), `${u.name} deactivated`)}
              disabled={isPending}
            >
              <PowerOff className="size-4" />
              Deactivate
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => activateUser(u.id), `${u.name} activated`)}
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
            onClick={() => setDeletingUser(u)}
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
        data={users}
        searchPlaceholder="Search users..."
        showSearch={false}
        emptyMessage="No users found."
      />
      <AlertDialog open={deletingUser !== null} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingUser?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingUser) {
                  handleAction(() => deleteUser(deletingUser.id), `${deletingUser.name} deleted`);
                  setDeletingUser(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={editingUser !== null} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <UserEditForm
              key={editingUser.id}
              action={updateUser.bind(null, editingUser.id)}
              defaultValues={{ name: editingUser.name, email: editingUser.email }}
              onClose={() => setEditingUser(null)}
              onSuccess={() => setEditingUser(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={assigningUser !== null} onOpenChange={(open) => !open && setAssigningUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Rooms — {assigningUser?.name}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search rooms..."
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
          />
          <div className="max-h-64 overflow-y-auto space-y-1 mt-1">
            {rooms
              .filter((r) => r.name.toLowerCase().includes(roomSearch.toLowerCase()))
              .map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleRoom(r.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors border border-zinc-600/15 cursor-pointer ${selectedRoomIds.has(r.id)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                    }`}
                >
                  {r.name}
                  {selectedRoomIds.has(r.id) && <Check className="size-4 shrink-0" />}
                </button>
              ))}
            {rooms.filter((r) => r.name.toLowerCase().includes(roomSearch.toLowerCase())).length === 0 && (
              <p className="text-sm text-muted-foreground px-3 py-2">No rooms found.</p>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setAssigningUser(null)}>Cancel</Button>
            <Button
              onClick={handleAssignRooms}
              disabled={isPending || (
                Array.from(selectedRoomIds).every((id) => originalMemberIds.has(id)) &&
                Array.from(originalMemberIds).every((id) => selectedRoomIds.has(id))
              )}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
