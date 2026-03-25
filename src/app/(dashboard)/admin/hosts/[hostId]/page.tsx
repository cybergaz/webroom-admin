import { notFound } from "next/navigation";
import { getHosts, updateHost } from "@/app/actions/hosts";
import { HostForm } from "@/components/org/host-form";

export default async function EditHostPage({
  params,
}: {
  params: Promise<{ hostId: string }>;
}) {
  const { hostId } = await params;
  const { hosts } = await getHosts();
  const host = hosts.find((h) => h.id === hostId);

  if (!host) notFound();

  const boundAction = updateHost.bind(null, hostId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Host</h1>
      <HostForm
        action={boundAction}
        defaultValues={{ name: host.name, email: host.email }}
        title="Edit Host"
        isEdit
        cancelHref="/admin/hosts"
      />
    </div>
  );
}
