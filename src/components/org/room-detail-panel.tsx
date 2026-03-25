"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  VolumeX,
  Volume2,
  UserMinus,
  StopCircle,
  LogOut,
  Play,
  Pause,
} from "lucide-react";
import {
  muteAll,
  unmuteAll,
  kickAll,
  endRoom,
  forceLogoutAll,
  activateRoom,
  deactivateRoom,
} from "@/app/actions/rooms";
import type { Room } from "@/lib/types/room";

export function RoomDetailPanel({ room }: { room: Room }) {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{room.name}</CardTitle>
          <Badge variant={room.status === "active" ? "default" : "secondary"}>
            {room.status}
          </Badge>
        </div>
        {room.description && (
          <p className="text-sm text-muted-foreground">{room.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {room.status === "inactive" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleAction(() => activateRoom(room.id), "Room activated")
              }
              disabled={isPending}
            >
              <Play className="size-4" />
              Activate
            </Button>
          )}
          {room.status === "active" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleAction(() => deactivateRoom(room.id), "Room deactivated")
              }
              disabled={isPending}
            >
              <Pause className="size-4" />
              Deactivate
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              handleAction(() => muteAll(room.id), "All users muted")
            }
            disabled={isPending}
          >
            <VolumeX className="size-4" />
            Mute All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              handleAction(() => unmuteAll(room.id), "All users unmuted")
            }
            disabled={isPending}
          >
            <Volume2 className="size-4" />
            Unmute All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              handleAction(() => kickAll(room.id), "All users kicked")
            }
            disabled={isPending}
          >
            <UserMinus className="size-4" />
            Kick All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              handleAction(
                () => forceLogoutAll(room.id),
                "All users force-logged out"
              )
            }
            disabled={isPending}
          >
            <LogOut className="size-4" />
            Force Logout All
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() =>
              handleAction(() => endRoom(room.id), "Room ended")
            }
            disabled={isPending}
          >
            <StopCircle className="size-4" />
            End Room
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
