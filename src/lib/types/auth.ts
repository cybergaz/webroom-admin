import type { Role } from "@/lib/constants";

export interface User {
  userId: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  status: "pending_approval" | "approved" | "rejected";
}

export interface Session {
  id: string;
  role: Role;
  name: string;
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
