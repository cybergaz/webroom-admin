import { getAdmins } from "@/app/actions/admins";
import { OverviewCards } from "@/components/super-admin/overview-cards";

export default async function SuperAdminDashboard() {
  const adminsData = await getAdmins();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <OverviewCards totalAdmins={adminsData.admins.length} />
    </div>
  );
}
