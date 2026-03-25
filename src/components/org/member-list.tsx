"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserMinus, Plus } from "lucide-react";
import { removeMember, addMember } from "@/app/actions/rooms";
import type { RoomMember } from "@/lib/types/room";

interface MemberListProps {
  roomId: string;
  members: RoomMember[];
}

export function MemberList({ roomId, members }: MemberListProps) {
  const [isPending, startTransition] = useTransition();
  const [newUserId, setNewUserId] = useState("");

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

  function handleAddMember() {
    if (!newUserId.trim()) return;
    handleAction(
      () => addMember(roomId, newUserId.trim()),
      "Member added"
    );
    setNewUserId("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members ({members.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter user ID..."
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={handleAddMember}
            disabled={isPending || !newUserId.trim()}
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>

        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members yet.</p>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <span className="font-medium">{member.name}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {member.phone ?? member.email}
                  </span>
                  <Badge variant="secondary" className="ml-2">
                    {member.role}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={() =>
                      handleAction(
                        () => removeMember(roomId, member.id),
                        `${member.name} removed`
                      )
                    }
                    disabled={isPending}
                  >
                    <UserMinus className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
