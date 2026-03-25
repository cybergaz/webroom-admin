import { createHost } from "@/app/actions/hosts";
import { HostForm } from "@/components/org/host-form";

export default function NewHostPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Host</h1>
      <HostForm action={createHost} title="Create Host" cancelHref="/admin/hosts" />
    </div>
  );
}
