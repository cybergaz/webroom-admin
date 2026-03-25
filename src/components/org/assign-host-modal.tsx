"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { assignHost } from "@/app/actions/rooms";
import type { Host } from "@/lib/types/admin";

interface AssignHostModalProps {
  roomId: string;
  hosts: Host[];
  currentHostId?: string;
}

export function AssignHostModal({
  roomId,
  hosts,
  currentHostId,
}: AssignHostModalProps) {
  const [selectedHostId, setSelectedHostId] = useState(currentHostId || "");
  const [isPending, startTransition] = useTransition();

  function handleAssign() {
    if (!selectedHostId) return;
    startTransition(async () => {
      try {
        await assignHost(roomId, selectedHostId);
        toast.success("Host assigned");
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

  return (
    <Dialog>
      <DialogTrigger className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 text-sm font-medium hover:bg-muted transition-colors">
        <UserPlus className="size-4" />
        Assign Host
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Host to Room</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <select
            value={selectedHostId}
            onChange={(e) => setSelectedHostId(e.target.value)}
            className="flex h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select a host</option>
            {hosts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.phone})
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <DialogClose className="inline-flex h-8 items-center rounded-lg border border-input px-2.5 text-sm font-medium hover:bg-muted transition-colors">
              Cancel
            </DialogClose>
            <Button
              size="sm"
              onClick={handleAssign}
              disabled={isPending || !selectedHostId}
            >
              Assign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
