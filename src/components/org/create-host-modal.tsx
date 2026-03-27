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
import { HostForm } from "@/components/org/host-form";
import { createHost } from "@/app/actions/hosts";

export function CreateHostModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Create New Host
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-bold">Create New Host</DialogTitle>
          </DialogHeader>
          <HostForm
            key={String(open)}
            action={createHost}
            onClose={() => setOpen(false)}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
