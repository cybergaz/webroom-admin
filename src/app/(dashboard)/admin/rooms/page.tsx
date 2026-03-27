import { getRooms } from "@/app/actions/rooms";
import { getHosts } from "@/app/actions/hosts";
import { RoomTable } from "@/components/org/room-table";
import { CreateRoomModal } from "@/components/org/create-room-modal";

export default async function RoomsPage() {
  const [{ rooms }, { hosts }] = await Promise.all([getRooms(), getHosts()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <CreateRoomModal hosts={hosts} />
      </div>
      <RoomTable rooms={rooms} />
    </div>
  );
}
