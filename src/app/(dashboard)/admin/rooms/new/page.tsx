import { createRoom } from "@/app/actions/rooms";
import { getHosts } from "@/app/actions/hosts";
import { RoomForm } from "@/components/org/room-form";

export default async function NewRoomPage() {
  const { hosts } = await getHosts("/admin");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Room</h1>
      <RoomForm action={createRoom} hosts={hosts} />
    </div>
  );
}
