import { notFound } from "next/navigation";
import { getRoomSessions } from "@/app/actions/rooms";
import { SpeakingTimeline } from "@/components/org/speaking-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ roomId: string; sessionId: string }>;
}) {
  const { roomId, sessionId } = await params;
  const { sessions } = await getRoomSessions(roomId);
  const session = sessions.find((s) => s.id === sessionId);

  if (!session) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Session Details</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Session Info</CardTitle>
            {session.endedAt ? (
              <Badge variant="secondary">Ended</Badge>
            ) : (
              <Badge variant="default">Active</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Started: </span>
            {formatDate(session.startedAt)}
          </div>
          {session.endedAt && (
            <div>
              <span className="text-muted-foreground">Ended: </span>
              {formatDate(session.endedAt)}
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Speaking Events: </span>
            {session.speakingEvents.length}
          </div>
        </CardContent>
      </Card>
      <SpeakingTimeline events={session.speakingEvents} />
    </div>
  );
}
