import { API_V1 } from "@/lib/constants";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: Record<string, string | number | undefined>;
};

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, params, headers: customHeaders, ...rest } = options;

  // Build URL with query params
  const url = new URL(`${API_V1}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  // Prefer the token the proxy just refreshed (forwarded via request header),
  // fall back to the cookie value.
  const { headers: reqHeaders } = await import("next/headers");
  const hdrs = await reqHeaders();
  const accessToken =
    hdrs.get("x-refreshed-access-token") ||
    (await (await import("@/lib/cookies")).getAccessToken());

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(url.toString(), {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 401 after proxy already ran — session is truly dead.
  if (res.status === 401) {
    const { redirect } = await import("next/navigation");
    redirect("/api/auth/logout");
  }

  // Handle no-content responses
  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data.error || "Request failed");
  }

  return data as T;
}

