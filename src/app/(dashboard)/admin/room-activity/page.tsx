import { getAccessToken } from "@/lib/cookies";
import { RoomActivityClient } from "./room-activity-client";

export default async function RoomActivityPage() {
  const token = (await getAccessToken()) ?? null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Room Activity</h1>
      <RoomActivityClient token={token} />
    </div>
  );
}
