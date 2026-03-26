import { redirect } from "next/navigation";
import { getSession } from "@/lib/cookies";
import { ROLE_DASHBOARD_ROUTES } from "@/lib/constants";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session) {
    const dest = ROLE_DASHBOARD_ROUTES[session.role];
    redirect(dest ?? "/login");
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-4">
      {children}
    </div>
  );
}
