import { getRooms, getPttRecordings, getRoomMembers } from "@/app/actions/rooms";
import { PttRecordingTable } from "@/components/org/ptt-recording-table";
import { PttRecordingFilters } from "@/components/org/ptt-recording-filters";

export default async function PttRecordingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; roomId?: string; userId?: string; }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const roomId = params.roomId || undefined;
  const userId = params.userId || undefined;

  let rooms: Awaited<ReturnType<typeof getRooms>>["rooms"] = [];
  let recordings: Awaited<ReturnType<typeof getPttRecordings>> = {
    data: [],
    total: 0,
    page: 1,
    limit: 20,
  };

  try {
    const [roomsRes, recordingsRes] = await Promise.all([
      getRooms(),
      getPttRecordings({ roomId, userId, page, limit: 20 }),
    ]);
    rooms = roomsRes.rooms;
    recordings = recordingsRes;
  } catch (e) {
    console.error("[ptt-recordings] Failed to fetch data:", e);
  }

  // Fetch room members for user filter when a room is selected
  let members: { id: string; name: string; }[] = [];
  if (roomId) {
    try {
      const { members: roomMembers } = await getRoomMembers(roomId);
      members = roomMembers.map((m) => ({ id: m.id, name: m.name }));
    } catch { }
  }

  const totalPages = Math.ceil(recordings.total / recordings.limit) || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">PTT Recordings</h1>
        <PttRecordingFilters
          rooms={rooms}
          members={members}
          currentRoomId={roomId}
          currentUserId={userId}
        />
      </div>
      <PttRecordingTable
        recordings={recordings.data}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
