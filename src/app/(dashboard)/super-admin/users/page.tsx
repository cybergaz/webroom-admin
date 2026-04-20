import { getAllUsersForSuperAdmin } from "@/app/actions/users";
import { AllUsersTable } from "@/components/super-admin/all-users-table";

export default async function SuperAdminUsersPage() {
  const { users } = await getAllUsersForSuperAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      <AllUsersTable users={users} />
    </div>
  );
}
