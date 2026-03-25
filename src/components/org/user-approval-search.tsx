"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Search } from "lucide-react";
import { searchPendingUser, approveUser, rejectUser } from "@/app/actions/users";
import { Spinner } from "@/components/ui/spinner";

interface PendingUser {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  requestId: string;
  createdAt: string;
}

export function UserApprovalSearch() {
  const [requestId, setRequestId] = useState("");
  const [user, setUser] = useState<PendingUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, startSearch] = useTransition();
  const [isActing, startAction] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!requestId.trim()) return;

    setError(null);
    setUser(null);

    startSearch(async () => {
      try {
        const result = await searchPendingUser(requestId.trim().toUpperCase());
        setUser(result.user);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function handleApprove() {
    if (!user) return;
    startAction(async () => {
      try {
        await approveUser(user.id);
        toast.success(`${user.name} approved`);
        setUser(null);
        setRequestId("");
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

  function handleReject() {
    if (!user) return;
    startAction(async () => {
      try {
        await rejectUser(user.id);
        toast.success(`${user.name} rejected`);
        setUser(null);
        setRequestId("");
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

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

      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Found</CardTitle>
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

            <div className="flex gap-2 pt-2">
              <Button onClick={handleApprove} disabled={isActing}>
                <Check className="size-4" />
                Approve
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={isActing}>
                <X className="size-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
