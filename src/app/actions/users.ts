"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api-client";
import type { ManagedUser, SuperAdminManagedUser } from "@/lib/types/admin";

export async function getUsers() {
  return apiFetch<{ users: ManagedUser[]; }>("/admin/users");
}

export async function getAllUsersForSuperAdmin() {
  return apiFetch<{ users: SuperAdminManagedUser[]; }>("/super-admin/users");
}

export type SearchUserCode = "PENDING_APPROVAL" | "AVAILABLE_FOR_ADOPTION" | "ALREADY_ADOPTED";
export type ApproveUserCode = "APPROVED_AND_ADOPTED" | "ADOPTED" | "ALREADY_ADOPTED";

export interface SearchedUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  requestId: string;
  status: "pending_approval" | "approved";
  createdByUserId?: string;
  createdAt: string;
}

export async function searchUser(requestId: string) {
  return apiFetch<{ user: SearchedUser; code: SearchUserCode; }>(
    `/admin/users/search?requestId=${encodeURIComponent(requestId)}`
  );
}

export async function createUser(
  _prevState: { error?: string; } | null,
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
  return { success: true };
}

export async function updateUser(
  userId: string,
  _prevState: { error?: string; } | null,
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
  return { success: true };
}

export async function approveUser(userId: string, temporaryPassword?: string) {
  const result = await apiFetch<{ id: string; status: string; code: ApproveUserCode; }>(
    `/admin/users/${userId}/approve`,
    { method: "POST", body: temporaryPassword ? { temporaryPassword } : {} }
  );
  revalidatePath("/admin/new-users");
  revalidatePath("/admin/users");
  return result;
}

export async function rejectUser(userId: string) {
  await apiFetch(`/admin/users/${userId}/reject`, {
    method: "POST",
  });
  revalidatePath("/admin/new-users");
  revalidatePath("/admin/users");
}

export async function adoptUser(userId: string) {
  await apiFetch(`/admin/users/${userId}/adopt`, { method: "POST" });
  revalidatePath("/admin/new-users");
}

export async function unadoptUser(userId: string) {
  await apiFetch(`/admin/users/${userId}/adopt`, { method: "DELETE" });
  revalidatePath("/admin/new-users");
}

export async function activateUser(userId: string) {
  await apiFetch(`/admin/users/${userId}/activate`, { method: "POST" });
  revalidatePath("/admin/users");
}

export async function deactivateUser(userId: string) {
  await apiFetch(`/admin/users/${userId}/deactivate`, { method: "POST" });
  revalidatePath("/admin/users");
}

export async function deonboardUser(userId: string) {
  await apiFetch(`/admin/users/${userId}/deonboard`, { method: "POST" });
  revalidatePath("/admin/users");
}

export async function hardDeleteUser(userId: string) {
  await apiFetch(`/super-admin/users/${userId}`, { method: "DELETE" });
  revalidatePath("/super-admin/users");
}

export async function forceLogoutUser(userId: string) {
  await apiFetch(`/admin/users/${userId}/force-logout`, { method: "POST" });
  revalidatePath("/admin/users");
}

export async function allowDeviceChangeUser(userId: string) {
  await apiFetch(`/admin/users/${userId}/allow-device-change`, { method: "POST" });
  revalidatePath("/admin/users");
}

export async function resetDeviceLockUser(userId: string) {
  await apiFetch(`/admin/users/${userId}/reset-device-lock`, { method: "POST" });
  revalidatePath("/admin/users");
}
