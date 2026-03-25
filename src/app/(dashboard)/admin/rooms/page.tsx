import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getRooms } from "@/app/actions/rooms";
import { RoomTable } from "@/components/org/room-table";

export default async function RoomsPage() {
  const { rooms } = await getRooms();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <Button>
          <Link href="/admin/rooms/new" className="flex items-center gap-2">
            <Plus className="size-4" />
            New Room
          </Link>
        </Button>
      </div>
      <RoomTable rooms={rooms} />
    </div>
  );
}
