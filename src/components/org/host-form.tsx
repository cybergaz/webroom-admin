"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { PhoneInput } from "@/components/ui/phone-input";

interface HostFormProps {
  action: (
    prevState: { error?: string; success?: boolean } | null,
    formData: FormData
  ) => Promise<{ error?: string; success?: boolean } | null>;
  defaultValues?: { name: string; email?: string };
  isEdit?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function HostForm({ action, defaultValues, isEdit, onClose, onSuccess }: HostFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const lastSubmitted = useRef<Record<string, string>>({});

  useEffect(() => {
    if (state?.success) onSuccess?.();
  }, [state?.success]); // eslint-disable-line react-hooks/exhaustive-deps

  const getDefault = (field: string) =>
    lastSubmitted.current[field] ?? (defaultValues as Record<string, string>)?.[field];

  return (
    <form
      action={(formData) => {
        lastSubmitted.current = {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          phone: formData.get("phone") as string,
          password: formData.get("password") as string,
        };
        formAction(formData);
      }}
      className="space-y-4"
    >
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
          key={`name-${state?.error}`}
          defaultValue={getDefault("name")}
          placeholder="Host name"
          required
        />
      </div>

      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="phone-number">Phone</Label>
          <PhoneInput key={`phone-${state?.error}`} name="phone" id="phone-number" autoComplete="tel" defaultValue={lastSubmitted.current.phone} />
          <p className="text-xs text-muted-foreground">Either phone or email is required</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          key={`email-${state?.error}`}
          defaultValue={getDefault("email")}
          placeholder="Email"
        />
        {!isEdit && (
          <p className="text-xs text-muted-foreground">Either phone or email is required</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{isEdit ? "New Password" : "Password"}</Label>
        <Input id="password" name="password" type="password" key={`password-${state?.error}`} defaultValue={lastSubmitted.current.password} placeholder={isEdit ? "Leave blank to keep current" : "Password"} required={!isEdit} minLength={6} />
        {isEdit && (
          <p className="text-xs text-muted-foreground">Min 6 characters. Leave blank to keep unchanged.</p>
        )}
      </div>

      <div className="flex gap-2">
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
