import { cn } from "@/lib/utils";
import type { LicenseInfo } from "@/lib/types/auth";

interface LicensePillProps {
  license: LicenseInfo | null | undefined;
  className?: string;
}

export function LicensePill({ license, className }: LicensePillProps) {
  if (!license || license.status === "none") return null;

  if (license.status === "expired") {
    return (
      <span
        className={cn(
          "inline-flex h-6 items-center rounded-full border border-destructive/30 bg-destructive/10 px-2.5 text-xs font-medium text-destructive",
          className,
        )}
        title={license.expiresAt ? `Expired on ${formatDate(license.expiresAt)}` : "Plan expired"}
      >
        Plan expired
      </span>
    );
  }

  const days = license.daysRemaining ?? 0;
  const warning = days <= 7;
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium",
        warning
          ? "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950 dark:text-amber-200"
          : "border-border bg-muted text-muted-foreground",
        className,
      )}
      title={license.expiresAt ? `Expires ${formatDate(license.expiresAt)}` : undefined}
    >
      {days === 1 ? "1 day left" : `${days} days left`}
    </span>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
