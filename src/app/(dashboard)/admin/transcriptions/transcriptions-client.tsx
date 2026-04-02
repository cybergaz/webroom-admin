"use client";

import { useState, useCallback, useRef, useTransition, useEffect } from "react";
import { useWebSocket, type WsEvent } from "@/hooks/use-websocket";
import { getRooms, getRoomTranscriptions } from "@/app/actions/rooms";
import type { Room, SessionWithTranscriptions } from "@/lib/types/room";
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
  Wifi,
  WifiOff,
  Check,
  Radio,
  History,
  ArrowLeft,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LiveCaption {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  text: string;
  startTime: string;
  endTime: string;
  receivedAt: number;
}

type ViewMode = "select" | "live" | "recorded";

// ─── Component ───────────────────────────────────────────────────────────────

export function TranscriptionsClient({ token }: { token: string | null }) {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("select");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Live mode state
  const [captions, setCaptions] = useState<LiveCaption[]>([]);
  const captionEndRef = useRef<HTMLDivElement>(null);
  const captionIdRef = useRef(0);

  // Recorded mode state
  const [sessions, setSessions] = useState<SessionWithTranscriptions[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Fetch rooms for the dialog
  const fetchRooms = useCallback(() => {
    startTransition(async () => {
      try {
        const data = await getRooms();
        setAllRooms(data.rooms);
      } catch {
        // ignore
      }
    });
  }, []);

  // Handle WS events for live captions
  const handleEvent = useCallback(
    (event: WsEvent) => {
      if (event.event !== "transcription.caption") return;

      const payload = (event.payload ?? event.data ?? {}) as Record<string, string>;
      const { roomId, userId, userName, text, startTime, endTime } = payload;

      if (!roomId || !text) return;

      setCaptions((prev) => [
        ...prev,
        {
          id: String(++captionIdRef.current),
          roomId,
          userId,
          userName: userName || "Unknown",
          text,
          startTime,
          endTime,
          receivedAt: Date.now(),
        },
      ]);
    },
    []
  );

  const { isConnected } = useWebSocket({ token, onEvent: handleEvent });

  // Auto-scroll for live captions
  useEffect(() => {
    if (viewMode === "live") {
      captionEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [captions, viewMode]);

  // Select a live room
  const selectLiveRoom = (room: Room) => {
    setSelectedRoom(room);
    setCaptions([]);
    setViewMode("live");
    setDialogOpen(false);
  };

  // Select a recorded room
  const selectRecordedRoom = async (room: Room) => {
    setSelectedRoom(room);
    setDialogOpen(false);
    setLoadingSessions(true);
    setViewMode("recorded");

    try {
      const data = await getRoomTranscriptions(room.id);
      setSessions(data.sessions);
      if (data.sessions.length > 0) {
        setSelectedSessionId(data.sessions[0].id);
      }
    } catch {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Go back to selection
  const goBack = () => {
    setViewMode("select");
    setSelectedRoom(null);
    setCaptions([]);
    setSessions([]);
    setSelectedSessionId(null);
  };

  const liveRooms = allRooms.filter((r) => r.status === "live");
  const recordedRooms = allRooms.filter((r) => r.status !== "live");

  // ─── Room Selection Screen ─────────────────────────────────────────────────

  if (viewMode === "select") {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                size="lg"
                className="text-lg px-8 py-6"
                onClick={fetchRooms}
              />
            }
          >
            Select Room
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Room</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto space-y-4">
              {isPending ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Loading...
                </p>
              ) : (
                <>
                  {/* Live Rooms Section */}
                  {liveRooms.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Radio className="size-4 text-green-500" />
                        <h3 className="text-sm font-semibold">Live Rooms</h3>
                      </div>
                      <div className="space-y-1">
                        {liveRooms.map((room) => (
                          <button
                            key={room.id}
                            type="button"
                            onClick={() => selectLiveRoom(room)}
                            className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted"
                          >
                            <div className="size-2 shrink-0 rounded-full bg-green-500 animate-pulse" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">
                                {room.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Live — tap for real-time transcription
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recorded Rooms Section */}
                  {recordedRooms.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <History className="size-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold">
                          Recorded Rooms
                        </h3>
                      </div>
                      <div className="space-y-1">
                        {recordedRooms.map((room) => (
                          <button
                            key={room.id}
                            type="button"
                            onClick={() => selectRecordedRoom(room)}
                            className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted"
                          >
                            <div className="size-2 shrink-0 rounded-full bg-muted-foreground/30" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">
                                {room.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                View past session transcriptions
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {liveRooms.length === 0 && recordedRooms.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No rooms found
                    </p>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ─── Live Transcription View ───────────────────────────────────────────────

  if (viewMode === "live") {
    const roomCaptions = captions.filter(
      (c) => c.roomId === selectedRoom?.id
    );

    return (
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon-sm" onClick={goBack}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h2 className="text-sm font-semibold">{selectedRoom?.name}</h2>
              <p className="text-xs text-muted-foreground">Live Transcription</p>
            </div>
          </div>
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
              {roomCaptions.length} caption{roomCaptions.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Live Caption Feed */}
        <div className="rounded-xl border bg-card">
          <div className="h-[calc(100vh-16rem)] overflow-y-auto p-4 space-y-3">
            {roomCaptions.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Radio className="size-8 text-muted-foreground/30 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm text-muted-foreground">
                    Waiting for speech...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Captions will appear here in real-time
                  </p>
                </div>
              </div>
            ) : (
              roomCaptions.map((caption) => (
                <div
                  key={caption.id}
                  className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="shrink-0 pt-0.5">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {caption.userName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium">
                        {caption.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {caption.startTime
                          ? new Date(caption.startTime).toLocaleTimeString()
                          : new Date(caption.receivedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 mt-0.5">
                      {caption.text}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={captionEndRef} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Recorded Transcription View ───────────────────────────────────────────

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-sm" onClick={goBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-sm font-semibold">{selectedRoom?.name}</h2>
            <p className="text-xs text-muted-foreground">
              Recorded Transcriptions
            </p>
          </div>
        </div>
        <span className="text-sm text-muted-foreground">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loadingSessions ? (
        <div className="flex h-[calc(100vh-16rem)] items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex h-[calc(100vh-16rem)] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No transcriptions found for this room
          </p>
        </div>
      ) : (
        <div className="flex gap-4 h-[calc(100vh-16rem)]">
          {/* Session List */}
          <div className="w-64 shrink-0 overflow-y-auto rounded-xl border bg-card">
            <div className="p-3 border-b">
              <h3 className="text-sm font-semibold">Sessions</h3>
            </div>
            <div className="p-2 space-y-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`flex w-full flex-col rounded-lg p-3 text-left transition-colors ${
                    selectedSessionId === session.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="text-xs font-medium">
                    {new Date(session.startedAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(session.startedAt).toLocaleTimeString()}
                    {session.endedAt &&
                      ` — ${new Date(session.endedAt).toLocaleTimeString()}`}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {session.transcriptions.length} entries
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Transcription Content */}
          <div className="flex-1 overflow-y-auto rounded-xl border bg-card p-4 space-y-3">
            {!selectedSession ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Select a session to view transcription
              </p>
            ) : selectedSession.transcriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No transcription entries for this session
              </p>
            ) : (
              selectedSession.transcriptions.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="shrink-0 pt-0.5">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {entry.user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium">
                        {entry.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.startTime).toLocaleTimeString()}
                        {" — "}
                        {new Date(entry.endTime).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 mt-0.5">
                      {entry.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
