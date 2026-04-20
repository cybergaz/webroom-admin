import { NextResponse } from "next/server";
import { API_V1 } from "@/lib/constants";
import { getRefreshToken, setAuthCookies, clearAuthCookies } from "@/lib/cookies";
import type { RefreshResponse } from "@/lib/types/auth";

export async function POST() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    await clearAuthCookies();
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const res = await fetch(`${API_V1}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await clearAuthCookies();
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }

  const data = (await res.json()) as RefreshResponse;

  await setAuthCookies(
    data.accessToken,
    data.refreshToken,
    data.getstreamToken,
    {
      id: data.user.userId,
      role: data.user.role,
      name: data.user.name,
      license: data.user.license ?? null,
    }
  );

  return NextResponse.json({ success: true });
}
