"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import type { Host } from "@/lib/types/admin";

interface RoomFormProps {
  action: (
    prevState: { error?: string } | null,
    formData: FormData
  ) => Promise<{ error?: string } | null>;
  hosts: Host[];
}

export function RoomForm({ action, hosts }: RoomFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>New Room</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Room Name</Label>
            <Input id="name" name="name" placeholder="Enter room name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Room description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostId">Assign Host (optional)</Label>
            <select
              id="hostId"
              name="hostId"
              className="flex h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">No host</option>
              {hosts.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner className="size-4" /> : "Create Room"}
            </Button>
            <Button variant="outline" type="button">
              <Link href="/admin/rooms">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
