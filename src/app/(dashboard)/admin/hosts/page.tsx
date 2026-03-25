import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getHosts } from "@/app/actions/hosts";
import { HostTable } from "@/components/org/host-table";

export default async function HostsPage() {
  const { hosts } = await getHosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hosts</h1>
        <Button>
          <Link href="/admin/hosts/new" className="flex items-center gap-2">
            <Plus className="size-4" />
            New Host
          </Link>
        </Button>
      </div>
      <HostTable hosts={hosts} basePath="/admin/hosts" />
    </div>
  );
}
