export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const API_V1 = `${API_BASE_URL}/v1`;

export const COOKIE_NAMES = {
  accessToken: "webroom_access_token",
  refreshToken: "webroom_refresh_token",
  getstreamToken: "webroom_getstream_token",
  session: "webroom_session",
} as const;

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  HOST: "host",
  USER: "user",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_DASHBOARD_ROUTES: Record<string, string> = {
  [ROLES.SUPER_ADMIN]: "/super-admin",
  [ROLES.ADMIN]: "/admin",
};
