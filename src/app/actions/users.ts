"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import type { ManagedUser } from "@/lib/types/admin";

export async function getUsers() {
  return apiFetch<{ users: ManagedUser[] }>("/admin/users");
}

export async function searchPendingUser(requestId: string) {
  return apiFetch<{ user: ManagedUser & { requestId: string; createdAt: string } }>(
    `/admin/users/search?requestId=${encodeURIComponent(requestId)}`
  );
}

export async function createUser(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const phone = (formData.get("phone") as string) || undefined;
  const email = (formData.get("email") as string) || undefined;
  const password = formData.get("password") as string;

  if (!name || !password) {
    return { error: "Name and password are required" };
  }
  if (!phone && !email) {
    return { error: "Phone or email is required" };
  }

  try {
    await apiFetch<ManagedUser>("/admin/users", {
      method: "POST",
      body: { name, phone, email, password },
    });
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(
  userId: string,
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const name = (formData.get("name") as string) || undefined;
  const email = (formData.get("email") as string) || undefined;

  try {
    await apiFetch(`/admin/users/${userId}`, {
      method: "PATCH",
      body: { name, email },
    });
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function approveUser(userId: string, temporaryPassword?: string) {
  await apiFetch(`/admin/users/${userId}/approve`, {
    method: "POST",
    body: temporaryPassword ? { temporaryPassword } : {},
  });
  revalidatePath("/admin/users/pending");
  revalidatePath("/admin/users");
}

export async function rejectUser(userId: string) {
  await apiFetch(`/admin/users/${userId}/reject`, {
    method: "POST",
  });
  revalidatePath("/admin/users/pending");
  revalidatePath("/admin/users");
}

export async function activateUser(userId: string) {
  await apiFetch(`/admin/users/${userId}/activate`, { method: "POST" });
  revalidatePath("/admin/users");
}

export async function deactivateUser(userId: string) {
  await apiFetch(`/admin/users/${userId}/deactivate`, { method: "POST" });
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  await apiFetch(`/admin/users/${userId}`, { method: "DELETE" });
  revalidatePath("/admin/users");
}

export async function forceLogoutUser(userId: string) {
  await apiFetch(`/admin/users/${userId}/force-logout`, { method: "POST" });
  revalidatePath("/admin/users");
}
