import {
  Home,
  Users,
  UserCheck,
  Mic,
  DoorOpen,
  History,
  Activity,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { ROLES, type Role } from "@/lib/constants";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const SUPER_ADMIN_NAV: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/super-admin", icon: Home },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Admins", href: "/super-admin/admins", icon: ShieldCheck },
    ],
  },
];

const ADMIN_NAV: NavGroup[] = [
  {
    label: "Main",
    items: [{ label: "Dashboard", href: "/admin", icon: Home }],
  },
  {
    label: "People",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "New Users", href: "/admin/new-users", icon: UserCheck },
      { label: "Hosts", href: "/admin/hosts", icon: Mic },
    ],
  },
  {
    label: "Rooms",
    items: [
      { label: "Rooms", href: "/admin/rooms", icon: DoorOpen },
      { label: "Room Activity", href: "/admin/room-activity", icon: Activity },
      { label: "Sessions", href: "/admin/sessions", icon: History },
    ],
  },
];

export function getNavGroups(role: Role): NavGroup[] {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return SUPER_ADMIN_NAV;
    case ROLES.ADMIN:
      return ADMIN_NAV;
    default:
      return [];
  }
}
