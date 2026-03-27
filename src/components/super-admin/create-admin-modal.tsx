"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminForm } from "@/components/super-admin/admin-form";
import { createAdmin } from "@/app/actions/admins";

export function CreateAdminModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        New Admin
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="min-w-lg min-h-[55%]">
          <DialogHeader>
            <DialogTitle className="font-bold">Create New Admin</DialogTitle>
          </DialogHeader>
          <AdminForm
            key={String(open)}
            action={createAdmin}
            onClose={() => setOpen(false)}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
