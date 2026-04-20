import { NextResponse } from "next/server";
import { API_V1 } from "@/lib/constants";
import { setAuthCookies } from "@/lib/cookies";
import type { LoginResponse } from "@/lib/types/auth";

export async function POST(request: Request) {
  const body = await request.json();

  const res = await fetch(`${API_V1}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const { accessToken, refreshToken, getstreamToken, user } =
    data as LoginResponse;

  await setAuthCookies(accessToken, refreshToken, getstreamToken, {
    id: user.userId,
    role: user.role,
    name: user.name,
    license: user.license ?? null,
  });

  return NextResponse.json({ user });
}
