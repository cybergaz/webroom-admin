"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  assignAdminLicense,
  extendAdminLicense,
  revokeAdminLicense,
} from "@/app/actions/admins";
import type { Admin } from "@/lib/types/admin";
import type { PlanDuration } from "@/lib/types/auth";

const PLAN_OPTIONS: { value: PlanDuration; label: string }[] = [
  { value: "1_month", label: "1 month" },
  { value: "3_months", label: "3 months" },
  { value: "6_months", label: "6 months" },
  { value: "1_year", label: "1 year" },
];

interface LicenseDialogProps {
  admin: Admin | null;
  onClose: () => void;
}

export function LicenseDialog({ admin, onClose }: LicenseDialogProps) {
  const [duration, setDuration] = useState<PlanDuration>("1_month");
  const [isPending, startTransition] = useTransition();

  if (!admin) return null;

  const existingLicense = admin.license ?? null;
  const hasLicense = existingLicense !== null;
  const expiresLabel = existingLicense?.expiresAt
    ? new Date(existingLicense.expiresAt).toLocaleDateString()
    : null;

  const run = (fn: () => Promise<void>, msg: string) =>
    startTransition(async () => {
      try {
        await fn();
        toast.success(msg);
        onClose();
      } catch (e) {
        toast.error((e as Error).message);
      }
    });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage license — {admin.name}</DialogTitle>
          <DialogDescription>
            {hasLicense
              ? existingLicense!.status === "expired"
                ? `Current plan expired on ${expiresLabel}.`
                : `Current plan expires on ${expiresLabel} (${existingLicense!.daysRemaining} days left).`
              : "No license assigned yet. Assign one to start the plan."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <Label>Plan duration</Label>
          <div className="grid grid-cols-2 gap-2">
            {PLAN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDuration(opt.value)}
                className={
                  "rounded-lg border px-3 py-2 text-sm transition-colors " +
                  (duration === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-4">
          <Button
            disabled={isPending}
            onClick={() =>
              run(
                () => assignAdminLicense(admin.id, duration),
                hasLicense ? "License replaced" : "License assigned",
              )
            }
          >
            {isPending ? <Spinner className="size-4" /> : hasLicense ? "Replace" : "Assign"}
          </Button>
          {hasLicense && (
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() =>
                run(
                  () => extendAdminLicense(admin.id, duration),
                  "License extended",
                )
              }
            >
              Extend by {PLAN_OPTIONS.find((p) => p.value === duration)?.label}
            </Button>
          )}
          {hasLicense && existingLicense!.status === "active" && (
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                run(() => revokeAdminLicense(admin.id), "License revoked")
              }
            >
              Revoke
            </Button>
          )}
          <Button variant="ghost" disabled={isPending} onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
