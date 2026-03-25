"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import type { Host } from "@/lib/types/admin";

export async function getHosts() {
  return apiFetch<{ hosts: Host[] }>("/admin/hosts");
}

export async function createHost(
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
    await apiFetch<Host>("/admin/hosts", {
      method: "POST",
      body: { name, phone, email, password },
    });
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/admin/hosts");
  redirect("/admin/hosts");
}

export async function updateHost(
  hostId: string,
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const name = (formData.get("name") as string) || undefined;
  const email = (formData.get("email") as string) || undefined;

  try {
    await apiFetch(`/admin/hosts/${hostId}`, {
      method: "PATCH",
      body: { name, email },
    });
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/admin/hosts");
  redirect("/admin/hosts");
}

export async function activateHost(hostId: string) {
  await apiFetch(`/admin/hosts/${hostId}/activate`, { method: "POST" });
  revalidatePath("/admin/hosts");
}

export async function deactivateHost(hostId: string) {
  await apiFetch(`/admin/hosts/${hostId}/deactivate`, { method: "POST" });
  revalidatePath("/admin/hosts");
}

export async function deleteHost(hostId: string) {
  await apiFetch(`/admin/hosts/${hostId}`, { method: "DELETE" });
  revalidatePath("/admin/hosts");
}
