"use client";

import { useState, useCallback } from "react";
import { useWebSocket, type WsEvent } from "@/hooks/use-websocket";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, WifiOff } from "lucide-react";

interface LiveUser {
  userId: string;
  name: string;
  isSpeaking: boolean;
}

interface RoomLiveMonitorProps {
  roomId: string;
  token: string | null;
}

export function RoomLiveMonitor({ roomId, token }: RoomLiveMonitorProps) {
  const [liveUsers, setLiveUsers] = useState<Map<string, LiveUser>>(new Map());

  const handleEvent = useCallback(
    (event: WsEvent) => {
      const data = event.data as Record<string, string> | undefined;
      if (data?.roomId !== roomId) return;

      switch (event.event) {
        case "speaking.start":
          setLiveUsers((prev) => {
            const next = new Map(prev);
            const user = next.get(data.userId);
            if (user) {
              next.set(data.userId, { ...user, isSpeaking: true });
            }
            return next;
          });
          break;
        case "speaking.end":
          setLiveUsers((prev) => {
            const next = new Map(prev);
            const user = next.get(data.userId);
            if (user) {
              next.set(data.userId, { ...user, isSpeaking: false });
            }
            return next;
          });
          break;
      }
    },
    [roomId]
  );

  const { isConnected } = useWebSocket({ token, onEvent: handleEvent });

  const users = Array.from(liveUsers.values());
  const speakingCount = users.filter((u) => u.isSpeaking).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Live Monitor</CardTitle>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? (
              <span className="flex items-center gap-1">
                <Wifi className="size-3" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <WifiOff className="size-3" /> Disconnected
              </span>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No live activity detected. Speaking events will appear here in real-time.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {speakingCount} user{speakingCount !== 1 ? "s" : ""} speaking
            </p>
            {users.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-2 rounded-lg border p-2"
              >
                <div
                  className={`size-2 rounded-full ${
                    user.isSpeaking
                      ? "bg-green-500 animate-pulse"
                      : "bg-muted-foreground"
                  }`}
                />
                <span className="text-sm font-medium">{user.name}</span>
                {user.isSpeaking && (
                  <Badge variant="default" className="ml-auto">
                    Speaking
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
