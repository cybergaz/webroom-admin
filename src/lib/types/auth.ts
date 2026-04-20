import type { Role } from "@/lib/constants";

export type PlanDuration = "1_month" | "3_months" | "6_months" | "1_year";

export interface LicenseInfo {
  status: "active" | "expired" | "none";
  expiresAt: string | null;
  daysRemaining: number | null;
  planDuration: PlanDuration | null;
  activatedAt: string | null;
}

export interface User {
  userId: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  status: "pending_approval" | "approved" | "rejected";
  license?: LicenseInfo | null;
}

export interface Session {
  id: string;
  role: Role;
  name: string;
  license?: LicenseInfo | null;
}

export interface LoginRequest {
  phone?: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  getstreamToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  getstreamToken: string;
  user: User;
}
