"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface HostFormProps {
  action: (
    prevState: { error?: string } | null,
    formData: FormData
  ) => Promise<{ error?: string } | null>;
  defaultValues?: { name: string; email?: string };
  title: string;
  isEdit?: boolean;
  cancelHref: string;
}

export function HostForm({ action, defaultValues, title, isEdit, cancelHref }: HostFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
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
              placeholder="Host name"
              required
            />
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" placeholder="Phone number" />
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

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner className="size-4" /> : "Save"}
            </Button>
            <Button variant="outline" type="button">
              <Link href={cancelHref}>Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
