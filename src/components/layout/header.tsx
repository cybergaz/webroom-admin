"use client";

import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { logout } from "@/app/actions/auth";
import { getInitials } from "@/lib/utils";
import type { Role } from "@/lib/constants";

interface HeaderProps {
  userName: string;
  role: Role;
}

export function Header({ userName, role }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
      <MobileSidebar role={role} />
      <Breadcrumb />

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium hover:bg-muted transition-colors outline-none">
            <Avatar className="size-6">
              <AvatarFallback className="text-xs">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">{userName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{userName}</span>
                <span className="text-xs font-normal text-muted-foreground capitalize">
                  {role.replace("_", " ")}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 size-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
