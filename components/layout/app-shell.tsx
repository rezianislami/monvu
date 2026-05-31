"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

// Owns the sidebar collapsed state so the main content margin tracks the
// sidebar width (240px ↔ 72px) — otherwise content keeps a 240px gap when
// the sidebar is collapsed.
export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

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
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
