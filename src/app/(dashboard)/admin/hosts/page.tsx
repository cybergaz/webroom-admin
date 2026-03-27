import { getHosts } from "@/app/actions/hosts";
import { HostTable } from "@/components/org/host-table";
import { CreateHostModal } from "@/components/org/create-host-modal";

export default async function HostsPage() {
  const { hosts } = await getHosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hosts</h1>
        <CreateHostModal />
      </div>
      <HostTable hosts={hosts} />
    </div>
  );
}
