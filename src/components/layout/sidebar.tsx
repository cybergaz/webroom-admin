"use client";

import { Headphones } from "lucide-react";
import { getNavGroups } from "@/lib/navigation";
import { NavItem } from "@/components/layout/nav-item";
import { Separator } from "@/components/ui/separator";
import type { Role } from "@/lib/constants";

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const groups = getNavGroups(role);

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Headphones className="size-5 text-primary" />
        <span className="text-lg font-semibold">Webroom</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {groups.map((group, i) => (
          <div key={group.label}>
            {i > 0 && <Separator className="my-3" />}
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
