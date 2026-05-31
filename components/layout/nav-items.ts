import { LayoutDashboard, Wallet, Target, TrendingUp, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assets", label: "Aset", icon: Wallet },
  { href: "/goals", label: "Target", icon: Target },
  { href: "/projections", label: "Proyeksi", icon: TrendingUp },
];
