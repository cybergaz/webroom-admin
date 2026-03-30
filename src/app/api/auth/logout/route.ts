import { NextRequest, NextResponse } from "next/server";
import { API_V1 } from "@/lib/constants";
import { getAccessToken, getRefreshToken, clearAuthCookies } from "@/lib/cookies";

// GET: force-logout — clears cookies and redirects to /login
export async function GET(req: NextRequest) {
  await clearAuthCookies();
  return NextResponse.redirect(new URL("/login", req.url));
}

export async function POST() {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  // Best-effort backend logout
  if (accessToken && refreshToken) {
    try {
      await fetch(`${API_V1}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore errors — we clear cookies regardless
    }
  }

  await clearAuthCookies();
  return NextResponse.json({ success: true });
}
