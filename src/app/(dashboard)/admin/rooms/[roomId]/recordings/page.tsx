import { getRoomRecordings } from "@/app/actions/rooms";
import { RecordingTable } from "@/components/org/recording-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function RoomRecordingsPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const { recordings } = await getRoomRecordings(roomId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/rooms">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Room Recordings</h1>
      </div>
      <RecordingTable recordings={recordings} />
    </div>
  );
}
