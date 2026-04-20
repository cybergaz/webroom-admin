import type { LicenseInfo, Session } from "@/lib/types/auth";

export function isLicenseExpired(license: LicenseInfo | null | undefined): boolean {
  return license?.status === "expired";
}

export function isPanelReadOnly(session: Session | null): boolean {
  if (!session) return false;
  if (session.role !== "admin") return false;
  return isLicenseExpired(session.license);
}
