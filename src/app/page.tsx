import { redirect } from "next/navigation";
import { getSession } from "@/lib/cookies";
import { ROLE_DASHBOARD_ROUTES } from "@/lib/constants";

export default async function RootPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const dest = ROLE_DASHBOARD_ROUTES[session.role];
  if (dest) redirect(dest);

  redirect("/login");
}
