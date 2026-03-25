"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import type { Room, RoomSession } from "@/lib/types/room";

export async function getRooms() {
  return apiFetch<{ rooms: Room[] }>("/admin/rooms");
}

export async function createRoom(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || undefined;
  const hostId = (formData.get("hostId") as string) || undefined;

  if (!name) return { error: "Room name is required" };

  try {
    await apiFetch("/rooms", {
      method: "POST",
      body: { name, description, hostId },
    });
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/admin/rooms");
  redirect("/admin/rooms");
}

export async function deleteRoom(roomId: string) {
  await apiFetch(`/rooms/${roomId}`, { method: "DELETE" });
  revalidatePath("/admin/rooms");
}

export async function addMember(roomId: string, userId: string) {
  await apiFetch(`/rooms/${roomId}/members`, {
    method: "POST",
    body: { userId },
  });
  revalidatePath(`/admin/rooms/${roomId}`);
}

export async function removeMember(roomId: string, userId: string) {
  await apiFetch(`/rooms/${roomId}/members/${userId}`, { method: "DELETE" });
  revalidatePath(`/admin/rooms/${roomId}`);
}

export async function muteMember(
  roomId: string,
  userId: string,
  muted: boolean
) {
  await apiFetch(`/rooms/${roomId}/members/${userId}/mute`, {
    method: "PATCH",
    body: { muted },
  });
  revalidatePath(`/admin/rooms/${roomId}`);
}

export async function muteAll(roomId: string) {
  await apiFetch(`/rooms/${roomId}/mute-all`, { method: "POST" });
  revalidatePath(`/admin/rooms/${roomId}`);
}

export async function unmuteAll(roomId: string) {
  await apiFetch(`/rooms/${roomId}/unmute-all`, { method: "POST" });
  revalidatePath(`/admin/rooms/${roomId}`);
}

export async function kickAll(roomId: string) {
  await apiFetch(`/rooms/${roomId}/kick-all`, { method: "POST" });
  revalidatePath(`/admin/rooms/${roomId}`);
}

export async function activateRoom(roomId: string) {
  await apiFetch(`/admin/rooms/${roomId}/activate`, { method: "POST" });
  revalidatePath(`/admin/rooms/${roomId}`);
  revalidatePath("/admin/rooms");
}

export async function deactivateRoom(roomId: string) {
  await apiFetch(`/admin/rooms/${roomId}/deactivate`, { method: "POST" });
  revalidatePath(`/admin/rooms/${roomId}`);
  revalidatePath("/admin/rooms");
}

export async function endRoom(roomId: string) {
  await apiFetch(`/rooms/${roomId}/end`, { method: "POST" });
  revalidatePath("/admin/rooms");
}

export async function forceLogoutAll(roomId: string) {
  await apiFetch(`/rooms/${roomId}/force-logout-all`, { method: "POST" });
  revalidatePath(`/admin/rooms/${roomId}`);
}

export async function assignHost(roomId: string, hostId: string) {
  await apiFetch(`/admin/rooms/${roomId}/assign-host`, {
    method: "POST",
    body: { hostId },
  });
  revalidatePath(`/admin/rooms/${roomId}`);
  revalidatePath("/admin/rooms");
}

export async function getSessions() {
  return apiFetch<{ sessions: RoomSession[] }>("/admin/sessions");
}

export async function getRoomSessions(roomId: string) {
  return apiFetch<{ sessions: RoomSession[] }>(`/admin/sessions/${roomId}`);
}
