"use server";

import { redirect } from "next/navigation";
import { API_V1, ROLE_DASHBOARD_ROUTES } from "@/lib/constants";
import { setAuthCookies, clearAuthCookies, getAccessToken, getRefreshToken } from "@/lib/cookies";
import type { LoginResponse } from "@/lib/types/auth";

export async function login(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const phone = formData.get("phone") as string | null;
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string;

  if (!phone && !email) {
    return { error: "Phone or email is required" };
  }
  if (!password) {
    return { error: "Password is required" };
  }

  const body: Record<string, string> = { password };
  if (phone) body.phone = phone;
  if (email) body.email = email;

  const res = await fetch(`${API_V1}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data.error || "Login failed" };
  }

  const { accessToken, refreshToken, getstreamToken, user } =
    data as LoginResponse;

  await setAuthCookies(accessToken, refreshToken, getstreamToken, {
    id: user.userId,
    role: user.role,
    name: user.name,
    license: user.license ?? null,
  });

  const dest = ROLE_DASHBOARD_ROUTES[user.role];
  if (!dest) {
    return { error: "This account does not have admin panel access" };
  }

  redirect(dest);
}

export async function logout() {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

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
      // Ignore
    }
  }

  await clearAuthCookies();
  redirect("/login");
}
