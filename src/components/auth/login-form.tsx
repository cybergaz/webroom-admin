"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { PhoneInput } from "@/components/ui/phone-input";

type LoginMethod = "phone" | "email";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [method, setMethod] = useState<LoginMethod>("phone");

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Phone / Email toggle */}
      <div className="flex rounded-lg border border-input p-0.5">
        <button
          type="button"
          onClick={() => setMethod("phone")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            method === "phone"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Phone
        </button>
        <button
          type="button"
          onClick={() => setMethod("email")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            method === "email"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Email
        </button>
      </div>

      {method === "phone" ? (
        <div className="space-y-2">
          <Label htmlFor="phone-number">Phone Number</Label>
          <PhoneInput
            name="phone"
            id="phone-number"
            required
            autoComplete="tel-national"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            required
            autoComplete="email"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Spinner className="size-4" /> : "Sign In"}
      </Button>
    </form>
  );
}
