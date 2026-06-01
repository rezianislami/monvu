"use client";

import { useCallback, useSyncExternalStore, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Same-tab setItem doesn't fire the "storage" event, so dismiss broadcasts this
// custom event to nudge useSyncExternalStore subscribers in the current tab.
const DISMISS_EVENT = "monvu:info-callout-dismiss";

// Dismissible info banner. The dismissed flag lives in localStorage keyed by
// `storageKey`, so once closed it stays closed for that browser.
//
// useSyncExternalStore (not useState+effect): reading localStorage in an effect
// trips the project's no-setState-in-effect rule and risks a hydration
// mismatch. getServerSnapshot returns false so SSR + first client paint agree
// (banner shown), then React re-reads localStorage after hydration.
export function InfoCallout({
  storageKey,
  children,
  className,
}: {
  storageKey: string;
  children: ReactNode;
  className?: string;
}) {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("storage", onChange); // cross-tab
    window.addEventListener(DISMISS_EVENT, onChange); // same-tab
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(DISMISS_EVENT, onChange);
    };
  }, []);

  const dismissed = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(storageKey) === "1",
    () => false
  );

  if (dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(storageKey, "1");
    window.dispatchEvent(new Event(DISMISS_EVENT));
  };

  return (
    <div
      className={cn(
        "relative flex gap-3 rounded-2xl border-2 border-[var(--nb-border)] bg-[var(--nb-yellow,#fde047)]/15 px-4 py-3 pr-10 text-sm",
        className
      )}
    >
      <span className="shrink-0 text-lg leading-tight">💡</span>
      <div className="text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">
        {children}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Tutup"
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
