import { getSessions } from "@/app/actions/rooms";
import { SessionTable } from "@/components/org/session-table";

export default async function AllSessionsPage() {
  const { sessions } = await getSessions();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Sessions</h1>
      <SessionTable sessions={sessions} />
    </div>
  );
}
