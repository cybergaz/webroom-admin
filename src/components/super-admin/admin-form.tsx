"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { PhoneInput } from "@/components/ui/phone-input";

interface AdminFormProps {
  action: (
    prevState: { error?: string; success?: boolean; } | null,
    formData: FormData
  ) => Promise<{ error?: string; success?: boolean; } | null>;
  defaultValues?: { name: string; email?: string; };
  isEdit?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function AdminForm({ action, defaultValues, isEdit, onClose, onSuccess }: AdminFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) onSuccess?.();
  }, [state?.success]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues?.name}
          placeholder="Admin name"
          required
        />
      </div>

      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="phone-number">Phone</Label>
          <PhoneInput name="phone" id="phone-number" autoComplete="tel" />
          <p className="text-xs text-muted-foreground">Either phone or email is required</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={defaultValues?.email}
          placeholder="Email"
        />
        {!isEdit && (
          <p className="text-xs text-muted-foreground">Either phone or email is required</p>
        )}
      </div>

      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="Password" required />
        </div>
      )}

      <div className="flex gap-3 mt-5">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Spinner className="size-4" /> : "Save"}
        </Button>
        {onClose && (
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
