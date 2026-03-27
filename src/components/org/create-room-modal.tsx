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
import { RoomForm } from "@/components/org/room-form";
import { createRoom } from "@/app/actions/rooms";
import type { Host } from "@/lib/types/admin";

export function CreateRoomModal({ hosts }: { hosts: Host[]; }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Create New Room
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-bold">Create New Room</DialogTitle>
          </DialogHeader>
          <RoomForm
            key={String(open)}
            action={createRoom}
            hosts={hosts}
            onClose={() => setOpen(false)}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
