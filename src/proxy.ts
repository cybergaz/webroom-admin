import { NextRequest, NextResponse } from "next/server";
import { API_V1, COOKIE_NAMES } from "@/lib/constants";
import type { RefreshResponse } from "@/lib/types/auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/refresh", "/api/auth/logout"];

function isJwtExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get(COOKIE_NAMES.accessToken)?.value;

  // Access token present and not expired — nothing to do
  if (accessToken && !isJwtExpired(accessToken)) {
    return NextResponse.next();
  }

  const refreshToken = req.cookies.get(COOKIE_NAMES.refreshToken)?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Attempt token refresh
  const refreshRes = await fetch(`${API_V1}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!refreshRes.ok) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete(COOKIE_NAMES.accessToken);
    res.cookies.delete(COOKIE_NAMES.refreshToken);
    res.cookies.delete(COOKIE_NAMES.getstreamToken);
    res.cookies.delete(COOKIE_NAMES.session);
    return res;
  }

  const data = (await refreshRes.json()) as RefreshResponse;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-refreshed-access-token", data.accessToken);

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  res.cookies.set(COOKIE_NAMES.accessToken, data.accessToken, {
    ...cookieOptions,
    maxAge: 60 * 15,
  });
  res.cookies.set(COOKIE_NAMES.refreshToken, data.refreshToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
  res.cookies.set(COOKIE_NAMES.getstreamToken, data.getstreamToken, {
    ...cookieOptions,
    maxAge: 60 * 15,
  });
  res.cookies.set(
    COOKIE_NAMES.session,
    JSON.stringify({ id: data.user.userId, role: data.user.role, name: data.user.name }),
    {
      ...cookieOptions,
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    }
  );

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
