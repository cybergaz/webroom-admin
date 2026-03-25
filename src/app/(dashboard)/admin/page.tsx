import { getUsers } from "@/app/actions/users";
import { getHosts } from "@/app/actions/hosts";
import { getRooms } from "@/app/actions/rooms";
import { DashboardCards } from "@/components/org/dashboard-cards";

export default async function AdminDashboard() {
  const [usersData, hostsData, roomsData] = await Promise.all([
    getUsers(),
    getHosts(),
    getRooms(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <DashboardCards
        totalUsers={usersData.users.length}
        totalHosts={hostsData.hosts.length}
        totalRooms={roomsData.rooms.length}
      />
    </div>
  );
}
