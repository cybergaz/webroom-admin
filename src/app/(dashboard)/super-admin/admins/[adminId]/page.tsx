import { notFound } from "next/navigation";
import { getAdmins, updateAdmin } from "@/app/actions/admins";
import { AdminForm } from "@/components/super-admin/admin-form";

export default async function EditAdminPage({
  params,
}: {
  params: Promise<{ adminId: string }>;
}) {
  const { adminId } = await params;
  const { admins } = await getAdmins();
  const admin = admins.find((a) => a.id === adminId);

  if (!admin) notFound();

  const boundAction = updateAdmin.bind(null, adminId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Admin</h1>
      <AdminForm
        action={boundAction}
        defaultValues={{ name: admin.name, email: admin.email }}
        title="Edit Admin"
        isEdit
      />
    </div>
  );
}
