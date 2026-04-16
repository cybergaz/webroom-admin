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
import { Pencil, Power, PowerOff, Trash2, DoorOpen, Check, Plus, Minus, Search, Smartphone, Unlock, RotateCcw, Settings, Circle, Lock } from "lucide-react";
import {
  activateUser,
  deactivateUser,
  deleteUser,
  updateUser,
  allowDeviceChangeUser,
  resetDeviceLockUser,
} from "@/app/actions/users";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRoomsForUser, assignUserToRooms, removeMember } from "@/app/actions/rooms";
import { UserEditForm } from "@/components/org/user-edit-form";
import type { ManagedUser } from "@/lib/types/admin";
import type { RoomWithMembership } from "@/lib/types/room";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";

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
  const [localUsers, setLocalUsers] = useState(users);
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
        setLocalUsers((prev) =>
          prev.map((u) =>
            u.id === assigningUser.id ? { ...u, assignedRoomCount: selectedRoomIds.size } : u
          )
        );
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
      sortable: true,
      render: (u) => (
        <span className="relative inline-flex items-center font-medium">
          {u.name}
        </span>
      ),
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
      key: "deviceName",
      header: "Device",
      render: (u) => (
        <div className="flex flex-col gap-0.5">
          {/* <span className="text-muted-foreground">{u.deviceName || "—"}</span> */}
          {u.lockedDeviceName
            ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground flex items-center gap-1">
                  <span className="text-primary flex items-center gap-1">
                    <Lock className="size-3" /> Locked
                  </span>
                  {/* {u.lockedDeviceName} */}
                </span>

                {u.allowDeviceChange && (
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-1">change allowed</Badge>
                )}
              </div>
            )
            : "—"
          }
        </div>
      ),
    },
    {
      key: "appVersion",
      header: "App Version",
      render: (u) => (
        <span className="text-muted-foreground">{u.appVersion || "—"}</span>
      ),
    },
    {
      key: "lastSeenAt",
      header: "Last Seen",
      sortable: true,
      render: (u) => (
        <span className="text-muted-foreground">
          {formatRelativeTime(u.lastSeenAt)}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      sortable: true,
      render: (u) => (
        <span className="text-muted-foreground">{formatDate(u.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-px whitespace-nowrap",
      render: (u) => (
        <div className="flex items-center gap-1  -ml-2.5">
          <Button variant="ghost" size="sm" onClick={() => openAssignRooms(u)} className={cn("bg-zinc-600/5 hover:bg-zinc-600/10", u.assignedRoomCount > 0 && "bg-green-500/10 hover:bg-green-600/20")}>
            <DoorOpen className={cn("size-4", u.assignedRoomCount > 0 && "text-green-700")} />
            {u.assignedRoomCount > 0 ? "Configure" : "Assign"} Rooms
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="size-4" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-50">
              <DropdownMenuItem onClick={() => setEditingUser(u)}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              {u.status === "approved" ? (
                <DropdownMenuItem onClick={() => handleAction(() => deactivateUser(u.id), `${u.name} deactivated`)}>
                  <PowerOff className="size-4" />
                  Deactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleAction(() => activateUser(u.id), `${u.name} activated`)}>
                  <Power className="size-4" />
                  Activate
                </DropdownMenuItem>
              )}
              {u.lockedDeviceId && !u.allowDeviceChange && (
                <DropdownMenuItem onClick={() => handleAction(() => allowDeviceChangeUser(u.id), `${u.name} can now login from a new device`)}>
                  <Unlock className="size-4" />
                  Allow Device Change
                </DropdownMenuItem>
              )}
              {u.lockedDeviceId && (
                <DropdownMenuItem onClick={() => handleAction(() => resetDeviceLockUser(u.id), `${u.name} device lock reset`)}>
                  <RotateCcw className="size-4" />
                  Reset Device
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setDeletingUser(u)}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={localUsers}
        showSearch={false}
        searchPlaceholder="Search by name, phone, email..."
        searchFn={(u, q) => {
          const l = q.toLowerCase();
          return (
            u.name.toLowerCase().includes(l) ||
            (u.phone?.toLowerCase().includes(l) ?? false) ||
            (u.email?.toLowerCase().includes(l) ?? false)
          );
        }}
        pageSize={20}
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Rooms — {assigningUser?.name}</DialogTitle>
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
            <Button variant="outline" onClick={() => setAssigningUser(null)}>Cancel</Button>
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
    </>
  );
}
