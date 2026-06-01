"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/data-store";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

// Owns the sidebar collapsed state so the main content margin tracks the
// sidebar width (240px ↔ 72px) — otherwise content keeps a 240px gap when
// the sidebar is collapsed.
export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { isGuest } = useData();

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div
        className={cn(
          // min-w-0 lets this flex column shrink so wide children (tables) don't
          // force horizontal page overflow on small screens.
          "flex min-w-0 flex-1 flex-col transition-all duration-300",
          // No left margin on mobile (sidebar is hidden, drawer used instead).
          collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"
        )}
      >
        <Header />
        {isGuest && (
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-b-[2.5px] border-[var(--nb-border)] bg-[var(--nb-yellow,#fde047)]/90 px-4 py-2 text-center text-xs font-medium text-black">
            <span className="inline-flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Mode tamu — data ini contoh dan tidak tersimpan.
            </span>
            <Link href="/signup" className="font-bold underline underline-offset-2">
              Daftar untuk simpan data
            </Link>
          </div>
        )}
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
