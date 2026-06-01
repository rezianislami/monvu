"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { openOnboarding } from "@/components/onboarding/onboarding-modal";
import { NAV_ITEMS } from "./nav-items";

// Mobile-only nav drawer (hamburger → slide-in). Desktop uses <Sidebar />.
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="lg:hidden" />}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Buka menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] bg-[var(--nb-surface)] p-0">
        <SheetTitle className="sr-only">Navigasi</SheetTitle>

        <div className="flex h-16 items-center gap-3 px-4 border-b-[2.5px] border-[var(--nb-border)]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--nb-border)] bg-[var(--nb-pink)] font-display text-lg font-extrabold text-white">
            M
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight">
            Mon<span className="text-[var(--nb-pink)]">vu</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1.5 p-3 mt-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wide transition-colors",
                  isActive
                    ? "border-[var(--nb-border)] bg-[var(--nb-pink)] text-white [box-shadow:2px_2px_0px_var(--nb-shadow)]"
                    : "border-transparent text-[var(--nb-text-muted)] hover:bg-[var(--nb-surface2)] hover:text-[var(--nb-text)]"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => {
              // Close the drawer first so it doesn't sit over the modal.
              setOpen(false);
              openOnboarding();
            }}
            className="flex w-full items-center gap-3 rounded-xl border-2 border-transparent px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-[var(--nb-text-muted)] transition-colors hover:bg-[var(--nb-surface2)] hover:text-[var(--nb-text)]"
          >
            <BookOpen className="h-5 w-5 shrink-0" />
            <span>Panduan</span>
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
