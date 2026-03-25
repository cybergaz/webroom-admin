"use client";

import { useState } from "react";
import { Menu, Headphones } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { getNavGroups } from "@/lib/navigation";
import { NavItem } from "@/components/layout/nav-item";
import type { Role } from "@/lib/constants";

export function MobileSidebar({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const groups = getNavGroups(role);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors lg:hidden">
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <Headphones className="size-5 text-primary" />
          <span className="text-lg font-semibold">Webroom</span>
        </div>
        <nav className="space-y-1 p-3" onClick={() => setOpen(false)}>
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
      </SheetContent>
    </Sheet>
  );
}
