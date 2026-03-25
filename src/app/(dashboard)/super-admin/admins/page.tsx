import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getAdmins } from "@/app/actions/admins";
import { AdminTable } from "@/components/super-admin/admin-table";

export default async function AdminsPage() {
  const { admins } = await getAdmins();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admins</h1>
        <Button>
          <Link href="/super-admin/admins/new" className="flex items-center gap-2">
            <Plus className="size-4" />
            New Admin
          </Link>
        </Button>
      </div>
      <AdminTable admins={admins} />
    </div>
  );
}
