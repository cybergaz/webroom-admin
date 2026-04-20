import { AlertTriangle } from "lucide-react";
import type { LicenseInfo } from "@/lib/types/auth";

interface LicenseBannerProps {
  license: LicenseInfo | null | undefined;
}

export function LicenseBanner({ license }: LicenseBannerProps) {
  if (!license || license.status !== "expired") return null;
  return (
    <div className="flex items-start gap-3 border-b border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-medium">Your plan has expired.</p>
        <p className="text-destructive/80">
          Contact support to renew. The panel is read-only until then — hosts
          under your account cannot start or join rooms.
        </p>
      </div>
    </div>
  );
}
