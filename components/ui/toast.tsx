"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CheckCircle2, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Global manager so toasts can be fired from outside React (e.g. lib/data-store).
// Why a standalone manager (vs only useToastManager): the data layer triggers
// success toasts from plain async callbacks, not from a component render.
export const toast = ToastPrimitive.createToastManager();

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();
  return toasts.map((t) => {
    const success = t.type === "success";
    return (
      <ToastPrimitive.Root
        key={t.id}
        toast={t}
        className={cn(
          "relative flex items-start gap-3 rounded-xl p-3.5 pr-9 text-sm shadow-lg ring-1",
          // Entrance/exit slide from the top of the screen.
          "transition-all duration-150 data-[starting-style]:-translate-y-2 data-[starting-style]:opacity-0 data-[ending-style]:-translate-y-1 data-[ending-style]:opacity-0",
          success
            ? "bg-emerald-600 text-white ring-emerald-700/40"
            : "bg-popover text-popover-foreground ring-foreground/10"
        )}
      >
        {success && <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-white" />}
        <div className="grid gap-0.5">
          <ToastPrimitive.Title className="font-heading text-sm leading-tight font-medium" />
          <ToastPrimitive.Description
            className={cn("text-xs", success ? "text-white/85" : "text-muted-foreground")}
          />
        </div>
        <ToastPrimitive.Close
          aria-label="Tutup"
          className={cn(
            "absolute top-2 right-2 rounded-md p-1 transition-colors",
            success
              ? "text-white/80 hover:text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <XIcon className="h-4 w-4" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
    );
  });
}

export function Toaster() {
  return (
    <ToastPrimitive.Provider toastManager={toast}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed right-4 top-4 z-100 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 outline-none">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}
