"use client";

import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { LicensePill } from "@/components/layout/license-pill";
import { logout } from "@/app/actions/auth";
import { getInitials } from "@/lib/utils";
import type { Role } from "@/lib/constants";
import type { LicenseInfo } from "@/lib/types/auth";

interface HeaderProps {
  userName: string;
  role: Role;
  license?: LicenseInfo | null;
}

export function Header({ userName, role, license }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
      <MobileSidebar role={role} />
      <Breadcrumb />

      <div className="ml-auto flex items-center gap-2">
        {role === "admin" && <LicensePill license={license} />}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium hover:bg-muted transition-colors outline-none">
            <Avatar className="size-6">
              <AvatarFallback className="text-xs">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">{userName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{userName}</span>
                  <span className="text-xs font-normal text-muted-foreground capitalize">
                    {role.replace("_", " ")}
                  </span>
                  {role === "admin" && license && license.status !== "none" && (
                    <span
                      className={
                        "mt-1 text-xs font-normal " +
                        (license.status === "expired"
                          ? "text-destructive"
                          : "text-muted-foreground")
                      }
                    >
                      {license.status === "expired"
                        ? "Plan expired — contact support"
                        : `Plan expires ${license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : ""}`}
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} variant="destructive">
              <LogOut className="mr-2 size-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
