import { cookies } from "next/headers";
import { COOKIE_NAMES } from "@/lib/constants";
import type { Session } from "@/lib/types/auth";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  getstreamToken: string,
  session: Session
) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAMES.accessToken, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 15, // 15 minutes
  });

  cookieStore.set(COOKIE_NAMES.refreshToken, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  cookieStore.set(COOKIE_NAMES.getstreamToken, getstreamToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 15,
  });

  cookieStore.set(COOKIE_NAMES.session, JSON.stringify(session), {
    ...COOKIE_OPTIONS,
    httpOnly: false, // Client-readable for role checks
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAMES.accessToken);
  cookieStore.delete(COOKIE_NAMES.refreshToken);
  cookieStore.delete(COOKIE_NAMES.getstreamToken);
  cookieStore.delete(COOKIE_NAMES.session);
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAMES.accessToken)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAMES.refreshToken)?.value;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAMES.session)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}
