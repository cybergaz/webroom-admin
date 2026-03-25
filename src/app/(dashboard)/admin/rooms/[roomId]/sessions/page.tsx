import { getRoomSessions } from "@/app/actions/rooms";
import { SessionTable } from "@/components/org/session-table";

export default async function RoomSessionsPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const { sessions } = await getRoomSessions(roomId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Room Sessions</h1>
      <SessionTable sessions={sessions} roomId={roomId} />
    </div>
  );
}
