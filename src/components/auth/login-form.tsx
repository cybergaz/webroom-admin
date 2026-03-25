"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

const COUNTRY_CODES = [
  { code: "+91", country: "IN", label: "India" },
  { code: "+1", country: "US", label: "United States" },
  { code: "+44", country: "GB", label: "United Kingdom" },
  { code: "+61", country: "AU", label: "Australia" },
  { code: "+86", country: "CN", label: "China" },
  { code: "+81", country: "JP", label: "Japan" },
  { code: "+49", country: "DE", label: "Germany" },
  { code: "+33", country: "FR", label: "France" },
  { code: "+971", country: "AE", label: "UAE" },
  { code: "+966", country: "SA", label: "Saudi Arabia" },
  { code: "+65", country: "SG", label: "Singapore" },
  { code: "+60", country: "MY", label: "Malaysia" },
  { code: "+62", country: "ID", label: "Indonesia" },
  { code: "+55", country: "BR", label: "Brazil" },
  { code: "+52", country: "MX", label: "Mexico" },
  { code: "+82", country: "KR", label: "South Korea" },
  { code: "+39", country: "IT", label: "Italy" },
  { code: "+34", country: "ES", label: "Spain" },
  { code: "+7", country: "RU", label: "Russia" },
  { code: "+27", country: "ZA", label: "South Africa" },
  { code: "+234", country: "NG", label: "Nigeria" },
  { code: "+254", country: "KE", label: "Kenya" },
  { code: "+92", country: "PK", label: "Pakistan" },
  { code: "+880", country: "BD", label: "Bangladesh" },
  { code: "+94", country: "LK", label: "Sri Lanka" },
  { code: "+977", country: "NP", label: "Nepal" },
] as const;

type LoginMethod = "phone" | "email";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [method, setMethod] = useState<LoginMethod>("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <form
      action={(formData) => {
        if (method === "phone") {
          formData.delete("email");
          formData.set("phone", `${countryCode}${phoneNumber}`);
        } else {
          formData.delete("phone");
        }
        return formAction(formData);
      }}
      className="space-y-4"
    >
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
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="h-9 w-[100px] shrink-0 rounded-lg border border-input bg-background px-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.country} {c.code}
                </option>
              ))}
            </select>
            <Input
              id="phone-number"
              type="tel"
              placeholder="Phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              autoComplete="tel-national"
              className="flex-1"
            />
          </div>
          {/* Hidden field for form submission */}
          <input type="hidden" name="phone" value={`${countryCode}${phoneNumber}`} />
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
