"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRupiah, calculateNetWorth } from "@/lib/calculations";
import { useData } from "@/lib/data-store";
import { authClient } from "@/lib/auth-client";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function Header() {
  const router = useRouter();
  const { assets } = useData();
  const { data: session } = authClient.useSession();
  // No liabilities tracked — net worth = total current value.
  const netWorth = calculateNetWorth(assets, []);

  const name = session?.user?.name ?? "Pengguna";
  const email = session?.user?.email ?? "";

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b-[2.5px] border-[var(--nb-border)] bg-[var(--nb-surface)]">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: mobile menu */}
        <div className="flex items-center gap-2 min-w-0">
          <MobileNav />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Net Worth quick display */}
          <div className="hidden md:flex flex-col items-end">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--nb-text-muted)]">
              Net Worth
            </span>
            <span className="font-display text-sm font-extrabold text-[var(--nb-pink)]">
              {formatRupiah(netWorth)}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
              <span className="hidden sm:block font-mono text-xs font-bold">{name}</span>
              <Avatar className="h-9 w-9 border-2 border-[var(--nb-border)] [box-shadow:2px_2px_0px_var(--nb-shadow)]">
                <AvatarFallback className="rounded-full bg-[var(--nb-pink)] text-white text-xs font-bold">
                  {initials(name)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <div className="px-1.5 py-1.5">
                <p className="text-sm font-medium leading-tight">{name}</p>
                {email && (
                  <p className="text-xs text-muted-foreground">{email}</p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
