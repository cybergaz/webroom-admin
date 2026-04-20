"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api-client";
import type { Admin } from "@/lib/types/admin";
import type { PlanDuration } from "@/lib/types/auth";

// ─── Admin CRUD (super_admin only) ──────────────────────────────────────────

export async function getAdmins() {
  return apiFetch<{ admins: Admin[] }>("/super-admin/admins");
}

export async function createAdmin(
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
    await apiFetch<Admin>("/super-admin/admins", {
      method: "POST",
      body: { name, phone, email, password },
    });
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/super-admin/admins");
  return { success: true };
}

export async function updateAdmin(
  adminId: string,
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const name = (formData.get("name") as string) || undefined;
  const email = (formData.get("email") as string) || undefined;
  const password = (formData.get("password") as string) || undefined;

  try {
    await apiFetch(`/super-admin/admins/${adminId}`, {
      method: "PATCH",
      body: { name, email, password },
    });
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/super-admin/admins");
  return { success: true };
}

export async function activateAdmin(adminId: string) {
  await apiFetch(`/super-admin/admins/${adminId}/activate`, {
    method: "POST",
  });
  revalidatePath("/super-admin/admins");
}

export async function deactivateAdmin(adminId: string) {
  await apiFetch(`/super-admin/admins/${adminId}/deactivate`, {
    method: "POST",
  });
  revalidatePath("/super-admin/admins");
}

export async function deleteAdmin(adminId: string) {
  await apiFetch(`/super-admin/admins/${adminId}`, { method: "DELETE" });
  revalidatePath("/super-admin/admins");
}

// ─── License actions ────────────────────────────────────────────────────────

export async function assignAdminLicense(adminId: string, planDuration: PlanDuration) {
  await apiFetch(`/super-admin/admins/${adminId}/license`, {
    method: "POST",
    body: { planDuration },
  });
  revalidatePath("/super-admin/admins");
}

export async function extendAdminLicense(adminId: string, planDuration: PlanDuration) {
  await apiFetch(`/super-admin/admins/${adminId}/license/extend`, {
    method: "POST",
    body: { planDuration },
  });
  revalidatePath("/super-admin/admins");
}

export async function revokeAdminLicense(adminId: string) {
  await apiFetch(`/super-admin/admins/${adminId}/license/revoke`, {
    method: "POST",
  });
  revalidatePath("/super-admin/admins");
}
