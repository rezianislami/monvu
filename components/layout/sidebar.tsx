"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeedbackDialog } from "@/components/feedback/feedback-dialog";
import { NAV_ITEMS } from "./nav-items";

// Controlled by AppShell so the main content margin can track the width.
// Desktop-only (lg+); mobile uses the drawer in <MobileNav />.
export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen hidden lg:flex flex-col border-r-[2.5px] border-[var(--nb-border)] bg-[var(--nb-surface)] transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b-[2.5px] border-[var(--nb-border)]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--nb-border)] bg-[var(--nb-pink)] font-display text-lg font-extrabold text-white">
          M
        </div>
        {!collapsed && (
          <span className="font-display text-lg font-extrabold tracking-tight">
            Mon<span className="text-[var(--nb-pink)]">vu</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 p-3 mt-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wide transition-all duration-100",
                isActive
                  ? "border-[var(--nb-border)] bg-[var(--nb-pink)] text-white [box-shadow:2px_2px_0px_var(--nb-shadow)]"
                  : "border-transparent text-[var(--nb-text-muted)] hover:bg-[var(--nb-surface2)] hover:text-[var(--nb-text)]"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Feedback — sits at the very bottom, just above the collapse control */}
      <div className="px-3 pb-1">
        <button
          onClick={() => setFeedbackOpen(true)}
          title="Saran & Masukan"
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border-2 border-transparent px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-[var(--nb-text-muted)] transition-all duration-100 hover:bg-[var(--nb-surface2)] hover:text-[var(--nb-text)]",
            collapsed && "justify-center"
          )}
        >
          <MessageSquarePlus className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Saran</span>}
        </button>
      </div>

      {/* Collapse button */}
      <div className="p-3 border-t border-border/50">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </aside>
  );
}
