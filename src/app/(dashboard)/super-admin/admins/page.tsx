import { getAdmins } from "@/app/actions/admins";
import { AdminTable } from "@/components/super-admin/admin-table";
import { CreateAdminModal } from "@/components/super-admin/create-admin-modal";

export default async function AdminsPage() {
  const { admins } = await getAdmins();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admins</h1>
        <CreateAdminModal />
      </div>
      <AdminTable admins={admins} />
    </div>
  );
}
