"use server";

import { apiFetch } from "@/lib/api-client";

export interface AttendanceRecord {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: "user" | "host";
  present: boolean;
  firstJoinAt: string | null;
}

export interface AttendanceResponse {
  data: AttendanceRecord[];
  total: number;
  page: number;
  limit: number;
  date: string;
}

export async function getAttendance(opts: {
  date?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return apiFetch<AttendanceResponse>("/admin/attendance", {
    params: {
      date: opts.date,
      search: opts.search,
      page: opts.page,
      limit: opts.limit,
    },
  });
}
