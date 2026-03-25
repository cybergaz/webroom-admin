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
import { MoreHorizontal, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import { activateAdmin, deactivateAdmin, deleteAdmin } from "@/app/actions/admins";
import type { Admin } from "@/lib/types/admin";

export function AdminTable({ admins }: { admins: Admin[] }) {
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

  const columns: Column<Admin>[] = [
    {
      key: "name",
      header: "Name",
      render: (a) => <span className="font-medium">{a.name}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (a) => <span className="text-muted-foreground">{a.phone}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (a) => (
        <span className="text-muted-foreground">{a.email || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (a) => (
        <Badge variant={a.status === "approved" ? "default" : "secondary"}>
          {a.status === "approved" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (a) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none">
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link
                href={`/super-admin/admins/${a.id}`}
                className="flex items-center gap-2"
              >
                <Pencil className="size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {a.status === "approved" ? (
              <DropdownMenuItem
                onClick={() => handleAction(() => deactivateAdmin(a.id), `${a.name} deactivated`)}
                disabled={isPending}
              >
                <PowerOff className="size-4" />
                Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => handleAction(() => activateAdmin(a.id), `${a.name} activated`)}
                disabled={isPending}
              >
                <Power className="size-4" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => handleAction(() => deleteAdmin(a.id), `${a.name} deleted`)}
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
      data={admins}
      showSearch={false}
      emptyMessage="No admins found."
    />
  );
}
