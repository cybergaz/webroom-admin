import { getRooms, getPttRecordings, getRoomMembers } from "@/app/actions/rooms";
import { PttRecordingTable } from "@/components/org/ptt-recording-table";
import { PttRecordingFilters } from "@/components/org/ptt-recording-filters";

export default async function PttRecordingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; roomId?: string; userId?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const roomId = params.roomId || undefined;
  const userId = params.userId || undefined;

  const [{ rooms }, recordings] = await Promise.all([
    getRooms(),
    getPttRecordings({ roomId, userId, page, limit: 20 }),
  ]);

  // Fetch room members for user filter when a room is selected
  let members: { id: string; name: string }[] = [];
  if (roomId) {
    try {
      const { members: roomMembers } = await getRoomMembers(roomId);
      members = roomMembers.map((m) => ({ id: m.id, name: m.name }));
    } catch {}
  }

  const totalPages = Math.ceil(recordings.total / recordings.limit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">PTT Recordings</h1>
      <PttRecordingFilters
        rooms={rooms}
        members={members}
        currentRoomId={roomId}
        currentUserId={userId}
      />
      <PttRecordingTable
        recordings={recordings.data}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
