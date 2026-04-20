import { redirect } from "next/navigation";
import { getSession } from "@/lib/cookies";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { LicenseBanner } from "@/components/layout/license-banner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex h-full flex-1">
      <Sidebar role={session.role} />
      <div className="flex flex-1 flex-col">
        <Header userName={session.name} role={session.role} license={session.license} />
        {session.role === "admin" && <LicenseBanner license={session.license} />}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
