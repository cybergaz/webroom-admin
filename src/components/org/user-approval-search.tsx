"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Info } from "lucide-react";
import { searchUser, approveUser } from "@/app/actions/users";
import type { SearchedUser, SearchUserCode } from "@/app/actions/users";
import { Spinner } from "@/components/ui/spinner";

interface SearchResult {
  user: SearchedUser;
  code: SearchUserCode;
}

const ONBOARD_TOAST: Record<string, string> = {
  APPROVED_AND_ADOPTED: "onboarded to your list",
  ADOPTED: "added to your list",
  ALREADY_ADOPTED: "is already in your list",
};

export function UserApprovalSearch() {
  const [requestId, setRequestId] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, startSearch] = useTransition();
  const [isActing, startAction] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!requestId.trim()) return;
    setError(null);
    setResult(null);
    startSearch(async () => {
      try {
        const data = await searchUser(requestId.trim().toUpperCase());
        setResult(data);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function handleOnboard() {
    if (!result) return;
    startAction(async () => {
      try {
        const { code } = await approveUser(result.user.id);
        toast.success(`${result.user.name} ${ONBOARD_TOAST[code] ?? "processed"}`);
        setResult(null);
        setRequestId("");
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

  const { user, code } = result ?? {};

  return (
    <div className="space-y-4 max-w-lg">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Enter Request ID (e.g. A3K9X2M1)"
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
          className="font-mono uppercase"
          maxLength={8}
        />
        <Button type="submit" disabled={isSearching || !requestId.trim()}>
          {isSearching ? <Spinner className="size-4" /> : <Search className="size-4" />}
          Search
        </Button>
      </form>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {user && code && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">User Found</CardTitle>
              {code === "PENDING_APPROVAL" && (
                <Badge variant="secondary">Not Onboarded</Badge>
              )}
              {code === "AVAILABLE_FOR_ADOPTION" && (
                <Badge variant="default">Not Onboarded</Badge>
              )}
              {code === "ALREADY_ADOPTED" && (
                <Badge variant="outline">In Your List</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user.name}</span>

              <span className="text-muted-foreground">Request ID</span>
              <span className="font-mono">{user.requestId}</span>

              {user.phone && (
                <>
                  <span className="text-muted-foreground">Phone</span>
                  <span>{user.phone}</span>
                </>
              )}

              {user.email && (
                <>
                  <span className="text-muted-foreground">Email</span>
                  <span>{user.email}</span>
                </>
              )}

              <span className="text-muted-foreground">Registered</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>

            {(code === "PENDING_APPROVAL" || code === "AVAILABLE_FOR_ADOPTION") && (
              <>
                <p className="text-sm text-muted-foreground">
                  Onboarding will add this user to your list so you can manage their account.
                </p>
                <div className="flex gap-2 pt-1">
                  <Button onClick={handleOnboard} disabled={isActing}>
                    <UserPlus className="size-4" />
                    Onboard
                  </Button>
                </div>
              </>
            )}

            {code === "ALREADY_ADOPTED" && (
              <div className="flex items-start gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                <Info className="size-4 mt-0.5 shrink-0" />
                This user is already in your list.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
