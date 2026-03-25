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

async function getServerAccessToken(): Promise<string | undefined> {
  // Dynamic import to avoid pulling server code into client bundles
  const { getAccessToken } = await import("@/lib/cookies");
  return getAccessToken();
}

async function refreshTokens(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}

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

  // Get access token (server-side)
  const accessToken = await getServerAccessToken();

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

// Client-side fetch that handles token refresh
export async function clientApiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, params, headers: customHeaders, ...rest } = options;

  const url = new URL(`${API_V1}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  let res = await fetch(url.toString(), {
    ...rest,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  // Retry once on 401 after refreshing
  if (res.status === 401) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      res = await fetch(url.toString(), {
        ...rest,
        headers,
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
      });
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data.error || "Request failed");
  }

  return data as T;
}
