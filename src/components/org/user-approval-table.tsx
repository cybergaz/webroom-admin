"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Check, X } from "lucide-react";
import { approveUser, rejectUser } from "@/app/actions/users";
import type { ManagedUser } from "@/lib/types/admin";

interface UserApprovalTableProps {
  users: ManagedUser[];
  apiPrefix: "/super-admin" | "/admin";
}

export function UserApprovalTable({ users, apiPrefix }: UserApprovalTableProps) {
  const [isPending, startTransition] = useTransition();

  function handleApprove(user: ManagedUser) {
    startTransition(async () => {
      try {
        await approveUser(user.id);
        toast.success(`${user.name} approved`);
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

  function handleReject(user: ManagedUser) {
    startTransition(async () => {
      try {
        await rejectUser(user.id);
        toast.success(`${user.name} rejected`);
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
      render: (u) => <span className="text-muted-foreground">{u.phone}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (u) => (
        <span className="text-muted-foreground">{u.email || "—"}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-32",
      render: (u) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={() => handleApprove(u)}
            disabled={isPending}
          >
            <Check className="size-4" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleReject(u)}
            disabled={isPending}
          >
            <X className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      showSearch={false}
      emptyMessage="No pending approvals."
    />
  );
}
