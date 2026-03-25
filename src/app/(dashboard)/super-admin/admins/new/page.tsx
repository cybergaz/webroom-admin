import { createAdmin } from "@/app/actions/admins";
import { AdminForm } from "@/components/super-admin/admin-form";

export default function NewAdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Admin</h1>
      <AdminForm action={createAdmin} title="Create Admin" />
    </div>
  );
}
