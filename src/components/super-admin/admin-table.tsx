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
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import { activateAdmin, deactivateAdmin, deleteAdmin, updateAdmin } from "@/app/actions/admins";
import { AdminForm } from "@/components/super-admin/admin-form";
import type { Admin } from "@/lib/types/admin";

export function AdminTable({ admins }: { admins: Admin[]; }) {
  const [isPending, startTransition] = useTransition();
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);

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
      header: "Actions",
      className: "w-px whitespace-nowrap",
      render: (a) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditingAdmin(a)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          {a.status === "approved" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => deactivateAdmin(a.id), `${a.name} deactivated`)}
              disabled={isPending}
            >
              <PowerOff className="size-4" />
              Deactivate
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => activateAdmin(a.id), `${a.name} activated`)}
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
            onClick={() => setDeletingAdmin(a)}
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
        data={admins}
        showSearch={false}
        emptyMessage="No admins found."
      />
      <AlertDialog open={deletingAdmin !== null} onOpenChange={(open) => !open && setDeletingAdmin(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingAdmin?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingAdmin) {
                  handleAction(() => deleteAdmin(deletingAdmin.id), `${deletingAdmin.name} deleted`);
                  setDeletingAdmin(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={editingAdmin !== null} onOpenChange={(open) => !open && setEditingAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>
          {editingAdmin && (
            <AdminForm
              key={editingAdmin.id}
              action={updateAdmin.bind(null, editingAdmin.id)}
              defaultValues={{ name: editingAdmin.name, email: editingAdmin.email }}
              isEdit
              onClose={() => setEditingAdmin(null)}
              onSuccess={() => setEditingAdmin(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
