import { getUsers } from "@/app/actions/users";
import { UserTable } from "@/components/org/user-table";

export default async function UsersPage() {
  const { users } = await getUsers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <UserTable users={users} basePath="/admin/users" />
    </div>
  );
}
