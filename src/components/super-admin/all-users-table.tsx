"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import { Trash2, Users as UsersIcon } from "lucide-react";
import { hardDeleteUser } from "@/app/actions/users";
import type { SuperAdminManagedUser } from "@/lib/types/admin";
import { formatDate, formatRelativeTime } from "@/lib/utils";

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

export function AllUsersTable({ users }: { users: SuperAdminManagedUser[]; }) {
  const [isPending, startTransition] = useTransition();
  const [localUsers, setLocalUsers] = useState(users);
  const [deletingUser, setDeletingUser] = useState<SuperAdminManagedUser | null>(null);

  function handleDelete(user: SuperAdminManagedUser) {
    startTransition(async () => {
      try {
        await hardDeleteUser(user.id);
        toast.success(`${user.name} deleted`);
        setLocalUsers((prev) => prev.filter((u) => u.id !== user.id));
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

  const columns: Column<SuperAdminManagedUser>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
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
      render: (u) => <span className="text-muted-foreground">{u.email || "—"}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (u) => <Badge variant="outline">{u.role}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (u) => statusBadge(u.status),
    },
    {
      key: "holders",
      header: "Holders",
      render: (u) => (
        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
          <Badge variant="secondary" className="tabular-nums">
            <UsersIcon className="size-3" />
            {u.holders.length}
          </Badge>
          {u.holders.length === 0 ? (
            <span className="text-muted-foreground text-xs">unadopted</span>
          ) : (
            <span className="text-muted-foreground text-xs truncate">
              {u.holders.map((h) => h.adminName).join(", ")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "lastSeenAt",
      header: "Last Seen",
      sortable: true,
      render: (u) => (
        <span className="text-muted-foreground">{formatRelativeTime(u.lastSeenAt)}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (u) => <span className="text-muted-foreground">{formatDate(u.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-px whitespace-nowrap",
      render: (u) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeletingUser(u)}
          disabled={isPending}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={localUsers}
        pageSize={20}
        searchPlaceholder="Search by name, phone, email..."
        searchFn={(u, q) => {
          const l = q.toLowerCase();
          return (
            u.name.toLowerCase().includes(l) ||
            (u.phone?.toLowerCase().includes(l) ?? false) ||
            (u.email?.toLowerCase().includes(l) ?? false) ||
            u.holders.some((h) => h.adminName.toLowerCase().includes(l))
          );
        }}
        emptyMessage="No users found."
      />
      <AlertDialog open={deletingUser !== null} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingUser?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the user from the database, including all adoptions,
              room allocations, and session history. The user will be force-logged-out on all
              devices. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingUser) {
                  handleDelete(deletingUser);
                  setDeletingUser(null);
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
