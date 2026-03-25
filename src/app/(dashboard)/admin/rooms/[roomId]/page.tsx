import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { getHosts } from "@/app/actions/hosts";
import { RoomDetailPanel } from "@/components/org/room-detail-panel";
import { MemberList } from "@/components/org/member-list";
import { AssignHostModal } from "@/components/org/assign-host-modal";
import type { Room, RoomMember } from "@/lib/types/room";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  let room: Room;
  try {
    room = await apiFetch<Room>(`/rooms/${roomId}`);
  } catch {
    notFound();
  }

  const { hosts } = await getHosts("/admin");

  let members: RoomMember[] = [];
  try {
    const data = await apiFetch<{ members: RoomMember[] }>(`/rooms/${roomId}/members`);
    members = data.members;
  } catch {
    // non-fatal
  }

  return (
    <div className="space-y-6">
      <RoomDetailPanel room={room} />
      <div className="flex items-center gap-2">
        <AssignHostModal
          roomId={roomId}
          hosts={hosts}
          currentHostId={room.hostId || undefined}
        />
      </div>
      <MemberList roomId={roomId} members={members} />
    </div>
  );
}
