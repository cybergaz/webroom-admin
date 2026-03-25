export interface Admin {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: string;
  createdAt: string;
}

export interface CreateAdminRequest {
  name: string;
  phone: string;
  email?: string;
  password: string;
}

export interface Host {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: string;
}

export interface CreateHostRequest {
  name: string;
  phone: string;
  email?: string;
  password: string;
}

export interface ManagedUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "user";
  status: "pending_approval" | "approved" | "rejected";
}

export interface CreateUserRequest {
  name: string;
  phone: string;
  email?: string;
  password: string;
}
