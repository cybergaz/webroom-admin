"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDuration } from "@/lib/utils";
import type { SpeakingEvent } from "@/lib/types/room";

interface SpeakingTimelineProps {
  events: SpeakingEvent[];
}

export function SpeakingTimeline({ events }: SpeakingTimelineProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Speaking Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No speaking events recorded.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by start time
  const sorted = [...events].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Speaking Timeline ({events.length} events)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {event.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{event.user.name}</span>
                  {event.durationSeconds !== undefined && (
                    <span className="text-sm font-medium text-primary">
                      {formatDuration(event.durationSeconds)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(event.startedAt)}
                  {event.endedAt && ` — ${formatDate(event.endedAt)}`}
                </div>
                <span className="text-xs text-muted-foreground">
                  {event.user.phone}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
