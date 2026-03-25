"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

interface UserEditFormProps {
  action: (
    prevState: { error?: string } | null,
    formData: FormData
  ) => Promise<{ error?: string } | null>;
  defaultValues: { name: string; email?: string };
  cancelHref: string;
}

export function UserEditForm({ action, defaultValues, cancelHref }: UserEditFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);

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
          defaultValue={defaultValues.name}
          placeholder="User name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={defaultValues.email}
          placeholder="Email"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Spinner className="size-4" /> : "Save"}
        </Button>
        <Button variant="outline" type="button">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
