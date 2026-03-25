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
  Pencil,
  Power,
  PowerOff,
  Trash2,
  LogOut,
} from "lucide-react";
import {
  activateUser,
  deactivateUser,
  deleteUser,
  forceLogoutUser,
} from "@/app/actions/users";
import type { ManagedUser } from "@/lib/types/admin";

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
  basePath: string;
}

export function UserTable({ users, basePath }: UserTableProps) {
  const [isPending, startTransition] = useTransition();

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
      key: "actions",
      header: "",
      className: "w-12",
      render: (u) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none">
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href={`${basePath}/${u.id}`} className="flex items-center gap-2">
                <Pencil className="size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {u.status === "approved" ? (
              <DropdownMenuItem
                onClick={() =>
                  handleAction(() => deactivateUser(u.id), `${u.name} deactivated`)
                }
                disabled={isPending}
              >
                <PowerOff className="size-4" />
                Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() =>
                  handleAction(() => activateUser(u.id), `${u.name} activated`)
                }
                disabled={isPending}
              >
                <Power className="size-4" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() =>
                handleAction(() => forceLogoutUser(u.id), `${u.name} logged out`)
              }
              disabled={isPending}
            >
              <LogOut className="size-4" />
              Force Logout
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() =>
                handleAction(() => deleteUser(u.id), `${u.name} deleted`)
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
      data={users}
      searchPlaceholder="Search users..."
      showSearch={false}
      emptyMessage="No users found."
    />
  );
}
