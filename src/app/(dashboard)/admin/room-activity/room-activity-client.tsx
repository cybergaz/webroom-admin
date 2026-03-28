"use client";

import { useState, useCallback, useRef, useTransition } from "react";
import { useWebSocket, type WsEvent } from "@/hooks/use-websocket";
import { getRoomActivity } from "@/app/actions/rooms";
import type { LiveRoom } from "@/lib/types/room";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LayoutGrid,
  Table as TableIcon,
  Wifi,
  WifiOff,
  Check,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Participant {
  userId: string;
  name: string;
  isSpeaking: boolean;
}

interface RoomState {
  id: string;
  name: string;
  hostId: string | null;
  hostName: string | null;
  participants: Map<string, Participant>;
}

type Layout = "grid" | "table";

const SPEAKING_STOP_DELAY = Number(
  process.env.NEXT_PUBLIC_SPEAKING_STOP_DELAY_MS ?? 2000
);

// ─── Component ───────────────────────────────────────────────────────────────

export function RoomActivityClient({ token }: { token: string | null; }) {
  const [availableRooms, setAvailableRooms] = useState<LiveRoom[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(
    new Set()
  );
  const [rooms, setRooms] = useState<Map<string, RoomState>>(new Map());
  const [started, setStarted] = useState(false);
  const [layout, setLayout] = useState<Layout>("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const roomsRef = useRef(rooms);
  roomsRef.current = rooms;
  const stopTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Fetch available live rooms
  const fetchLiveRooms = useCallback(() => {
    startTransition(async () => {
      try {
        const data = await getRoomActivity();
        setAvailableRooms(data.rooms);
      } catch {
        // ignore
      }
    });
  }, []);

  // Handle WS events
  const setSpeaking = useCallback(
    (roomId: string, userId: string, userName: string | undefined, speaking: boolean) => {
      setRooms((prev) => {
        const room = prev.get(roomId);
        if (!room) return prev;

        const participants = new Map(room.participants);
        const existing = participants.get(userId);

        if (speaking) {
          participants.set(userId, {
            userId,
            name: existing?.name ?? userName ?? "Unknown",
            isSpeaking: true,
          });
        } else if (existing) {
          participants.set(userId, { ...existing, isSpeaking: false });
        } else {
          return prev;
        }

        const next = new Map(prev);
        next.set(roomId, { ...room, participants });
        return next;
      });
    },
    []
  );

  const handleEvent = useCallback(
    (event: WsEvent) => {
      const payload = (event.payload ?? event.data ?? {}) as Record<string, string>;
      const { roomId, userId, userName } = payload;
      if (!roomId || !userId) return;

      if (
        event.event !== "speaking.start" &&
        event.event !== "speaking.end"
      )
        return;

      // Check host from current rooms state
      const room = roomsRef.current.get(roomId);
      if (room?.hostId && userId === room.hostId) return;

      const timerKey = `${roomId}:${userId}`;

      if (event.event === "speaking.start") {
        // Cancel any pending stop for this user
        const existing = stopTimers.current.get(timerKey);
        if (existing) {
          clearTimeout(existing);
          stopTimers.current.delete(timerKey);
        }
        setSpeaking(roomId, userId, userName, true);
      } else {
        // Debounce the stop event
        const existing = stopTimers.current.get(timerKey);
        if (existing) clearTimeout(existing);
        stopTimers.current.set(
          timerKey,
          setTimeout(() => {
            stopTimers.current.delete(timerKey);
            setSpeaking(roomId, userId, undefined, false);
          }, SPEAKING_STOP_DELAY)
        );
      }
    },
    [setSpeaking]
  );

  const { isConnected } = useWebSocket({ token, onEvent: handleEvent });

  // Toggle room selection in dialog
  const toggleRoom = (roomId: string) => {
    setSelectedRoomIds((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  };

  // Confirm room selection
  const confirmSelection = () => {
    const roomMap = new Map<string, RoomState>();
    for (const room of availableRooms) {
      if (selectedRoomIds.has(room.id)) {
        const participants = new Map<string, Participant>();
        for (const p of room.participants) {
          participants.set(p.userId, {
            userId: p.userId,
            name: p.name,
            isSpeaking: false,
          });
        }
        roomMap.set(room.id, { id: room.id, name: room.name, hostId: room.hostId, hostName: room.hostName, participants });
      }
    }
    setRooms(roomMap);
    setStarted(true);
    setDialogOpen(false);
  };

  // Sort participants: speaking first, then alphabetical
  const sortParticipants = (participants: Map<string, Participant>) => {
    return Array.from(participants.values()).sort((a, b) => {
      if (a.isSpeaking && !b.isSpeaking) return -1;
      if (!a.isSpeaking && b.isSpeaking) return 1;
      return a.name.localeCompare(b.name);
    });
  };

  // ─── Select Rooms Screen ──────────────────────────────────────────────────

  if (!started) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                size="lg"
                className="text-lg px-8 py-6"
                onClick={fetchLiveRooms}
              />
            }
          >
            Select Rooms
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Live Rooms</DialogTitle>
            </DialogHeader>
            <div className="max-h-80 overflow-y-auto space-y-1">
              {isPending ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Loading...
                </p>
              ) : availableRooms.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No live rooms found
                </p>
              ) : (
                availableRooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => toggleRoom(room.id)}
                    className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted"
                  >
                    <div
                      className={`flex size-5 shrink-0 items-center justify-center rounded border ${selectedRoomIds.has(room.id)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                        }`}
                    >
                      {selectedRoomIds.has(room.id) && (
                        <Check className="size-3" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {room.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {room.participants.length} participant
                        {room.participants.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
            {availableRooms.length > 0 && (
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setSelectedRoomIds(
                      new Set(availableRooms.map((r) => r.id))
                    )
                  }
                  size="sm"
                >
                  Select All
                </Button>
                <Button
                  onClick={confirmSelection}
                  disabled={selectedRoomIds.size === 0}
                  size="sm"
                >
                  Confirm ({selectedRoomIds.size})
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ─── Activity View ────────────────────────────────────────────────────────

  const roomList = Array.from(rooms.values());

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? (
              <span className="flex items-center gap-1">
                <Wifi className="size-3" /> Live
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <WifiOff className="size-3" /> Disconnected
              </span>
            )}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {roomList.length} room{roomList.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={layout === "grid" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => setLayout("grid")}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={layout === "table" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => setLayout("table")}
          >
            <TableIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStarted(false);
              setSelectedRoomIds(new Set());
              setRooms(new Map());
            }}
          >
            Change Rooms
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      {layout === "grid" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {roomList.map((room) => {
            const sorted = sortParticipants(room.participants);
            const speakingCount = sorted.filter((p) => p.isSpeaking).length;
            return (
              <div
                key={room.id}
                className="flex flex-col rounded-xl border bg-card"
              >
                {/* Room header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold truncate">
                      {room.name}
                    </h3>
                    {room.hostName && (
                      <p className="text-xs text-muted-foreground truncate">
                        Host: {room.hostName}
                      </p>
                    )}
                  </div>
                  {speakingCount > 0 && (
                    <Badge variant="default" className="ml-2 shrink-0">
                      {speakingCount} speaking
                    </Badge>
                  )}
                </div>
                {/* Participants grid */}
                <div className="max-h-64 overflow-y-auto p-3">
                  {sorted.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No participants
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {sorted.map((p) => (
                        <div
                          key={p.userId}
                          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-8 transition-colors ${p.isSpeaking
                            ? "border-green-500/50 bg-green-500/10"
                            : ""
                            }`}
                        >
                          {/* <div */}
                          {/*   className={`size-2 shrink-0 rounded-full ${p.isSpeaking */}
                          {/*       ? "bg-green-500 animate-pulse" */}
                          {/*       : "bg-muted-foreground/30" */}
                          {/*     }`} */}
                          {/* /> */}
                          <span className="text-xs font-medium truncate">
                            {p.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Layout */}
      {layout === "table" && (
        <div className="rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Room</th>
                <th className="px-4 py-3 text-left font-medium">Host</th>
                <th className="px-4 py-3 text-left font-medium">
                  Participants
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  Active Speaker
                </th>
              </tr>
            </thead>
            <tbody>
              {roomList.map((room) => {
                const sorted = sortParticipants(room.participants);
                const speakers = sorted.filter((p) => p.isSpeaking);
                return (
                  <tr key={room.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{room.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {room.hostName ?? "--"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {room.participants.size}
                    </td>
                    <td className="px-4 py-3">
                      {speakers.length === 0 ? (
                        <span className="text-muted-foreground">--</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {speakers.map((s) => (
                            <div
                              key={s.userId}
                              className="flex items-center gap-2"
                            >
                              <div className="size-2 shrink-0 rounded-full bg-green-500 animate-pulse" />
                              <span>{s.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
