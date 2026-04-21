"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api-client";
import type { Room, RoomSession, RoomWithMembership, LiveRoom, Recording, PttRecording, SessionWithTranscriptions, TranscriptionEntry } from "@/lib/types/room";
import type { PaginatedResponse } from "@/lib/types/api";

export async function getRooms() {
  return apiFetch<{ rooms: Room[]; }>("/admin/rooms");
}

export async function getRoomsForUser(userId: string) {
  return apiFetch<{ rooms: RoomWithMembership[]; }>(`/admin/rooms-with-membership/${userId}`);
}

export async function createRoom(
  _prevState: { error?: string; } | null,
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
  return { success: true };
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

export async function unassignHost(roomId: string) {
  await apiFetch(`/rooms/${roomId}/unassign-host`, { method: "POST" });
  revalidatePath(`/admin/rooms/${roomId}`);
  revalidatePath("/admin/rooms");
}

export async function updateRoomContent(
  roomId: string,
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  // Trim, drop blanks; preserve order.
  const banners = formData
    .getAll("banners")
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v.length > 0);

  const rawMarquee = formData.get("marqueeText");
  const marqueeText =
    typeof rawMarquee === "string" ? rawMarquee.trim() : "";

  // Basic URL sanity check so we don't ship obviously broken URLs.
  for (const url of banners) {
    if (!/^https?:\/\//i.test(url)) {
      return { error: `Banner URLs must start with http:// or https:// (got "${url}")` };
    }
  }

  try {
    await apiFetch(`/rooms/${roomId}/content`, {
      method: "PATCH",
      body: {
        banners,
        marqueeText: marqueeText.length > 0 ? marqueeText : null,
      },
    });
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath(`/admin/rooms/${roomId}`);
  return { success: true };
}

export async function getSessions() {
  return apiFetch<{ sessions: RoomSession[]; }>("/admin/sessions");
}

export async function getRoomSessions(roomId: string) {
  return apiFetch<{ sessions: RoomSession[]; }>(`/admin/sessions/${roomId}`);
}

export async function assignUserToRooms(userId: string, roomIds: string[]) {
  return apiFetch("/rooms/members", {
    method: "POST",
    body: { userId, roomIds },
  });
}

export async function getRoomActivity() {
  return apiFetch<{ rooms: LiveRoom[] }>("/admin/room-activity");
}

export async function getRoomRecordings(roomId: string) {
  return apiFetch<{ recordings: Recording[] }>(`/admin/rooms/${roomId}/recordings`);
}

export async function getPttRecordings(params?: {
  roomId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}) {
  return apiFetch<PaginatedResponse<PttRecording>>("/admin/ptt-recordings", {
    params: {
      roomId: params?.roomId,
      userId: params?.userId,
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    },
  });
}

export async function getPttRecordingUrl(recordingId: string) {
  return apiFetch<{ url: string }>(`/admin/ptt-recordings/${recordingId}/url`);
}

export async function getRoomTranscriptions(roomId: string) {
  return apiFetch<{ sessions: SessionWithTranscriptions[] }>(`/admin/rooms/${roomId}/transcriptions`);
}

export async function getSessionTranscriptions(roomId: string, sessionId: string) {
  return apiFetch<{ transcriptions: TranscriptionEntry[] }>(`/admin/transcriptions/${roomId}/${sessionId}`);
}

export async function getRoomMembers(roomId: string) {
  return apiFetch<{ members: { id: string; name: string; phone: string | null; email: string | null; role: string; addedAt: string }[] }>(`/rooms/${roomId}/members`);
}
