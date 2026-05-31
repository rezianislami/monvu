"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

// DESIGN.md §5.8 — brutalist pill toggle with press interaction.
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Mode terang" : "Mode gelap"}
      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--nb-border)] bg-[var(--nb-surface)] text-[var(--nb-text)] [box-shadow:3px_3px_0px_var(--nb-shadow)] transition-all duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:[box-shadow:1px_1px_0px_var(--nb-shadow)] active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_0px_var(--nb-shadow)]"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
