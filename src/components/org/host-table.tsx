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
import { activateHost, deactivateHost, deleteHost } from "@/app/actions/hosts";
import type { Host } from "@/lib/types/admin";

interface HostTableProps {
  hosts: Host[];
  basePath: string;
}

export function HostTable({ hosts, basePath }: HostTableProps) {
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

  const columns: Column<Host>[] = [
    {
      key: "name",
      header: "Name",
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
      key: "actions",
      header: "",
      className: "w-12",
      render: (h) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none">
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href={`${basePath}/${h.id}`} className="flex items-center gap-2">
                <Pencil className="size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {h.status === "approved" ? (
              <DropdownMenuItem
                onClick={() => handleAction(() => deactivateHost(h.id), `${h.name} deactivated`)}
                disabled={isPending}
              >
                <PowerOff className="size-4" />
                Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => handleAction(() => activateHost(h.id), `${h.name} activated`)}
                disabled={isPending}
              >
                <Power className="size-4" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => handleAction(() => deleteHost(h.id), `${h.name} deleted`)}
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
      data={hosts}
      showSearch={false}
      emptyMessage="No hosts found."
    />
  );
}
