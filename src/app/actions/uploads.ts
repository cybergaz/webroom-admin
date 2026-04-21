"use server";

import { API_BASE_URL, API_V1 } from "@/lib/constants";
import { getAccessToken } from "@/lib/cookies";

export interface UploadBannerResult {
  url?: string;
  error?: string;
}

/**
 * Forwards a banner image from the browser to the backend `/uploads/banner`
 * endpoint (multipart). Returns the public asset URL that can be pushed into
 * the room's banners array via `updateRoomContent`.
 */
export async function uploadBanner(
  formData: FormData,
): Promise<UploadBannerResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "No file provided" };
  }

  const token = await getAccessToken();
  const fd = new FormData();
  fd.append("file", file);

  let res: Response;
  try {
    res = await fetch(`${API_V1}/uploads/banner`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: fd,
    });
  } catch (e) {
    return { error: (e as Error).message };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Upload failed" }));
    return { error: body.error || `Upload failed (${res.status})` };
  }

  const data = (await res.json()) as { key?: string };
  if (!data.key) return { error: "Upload succeeded but server returned no key" };

  return { url: `${API_BASE_URL}/v1/assets/${data.key}` };
}
