"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ComponentType,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  LayoutDashboard,
  PartyPopper,
  RefreshCw,
  Target,
  TrendingUp,
  Wallet,
  type LucideProps,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/data-store";
import { authClient } from "@/lib/auth-client";

// Show-once flag lives in localStorage, keyed PER USER id. Keying per-user (not
// a single global key) is what makes a freshly registered account see the tour
// even when an earlier account already dismissed it in the same browser.
// MVP choice over a DB column: there's a "Panduan" menu to re-open, so a
// re-show on a new browser is harmless. Upgrade to a per-account DB flag later
// if cross-device matters.
const SEEN_KEY_PREFIX = "monvu:onboarding-seen";
const seenKeyFor = (userId: string) => `${SEEN_KEY_PREFIX}:${userId}`;
// Custom events: OPEN_EVENT re-opens the tour on demand (Panduan menu);
// SEEN_EVENT nudges the useSyncExternalStore read after we persist the flag in
// the same tab (setItem doesn't fire "storage" for the tab that wrote it) —
// same trick as InfoCallout.
const OPEN_EVENT = "monvu:open-onboarding";
const SEEN_EVENT = "monvu:onboarding-seen-change";

// Called from the sidebar / mobile-nav "Panduan" buttons to re-open the tour.
export function openOnboarding() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type Slide = {
  icon: ComponentType<LucideProps>;
  accent: string;
  title: string;
  body: string;
};

// Static content only — no inputs. Slide 1 is the welcome; 2–6 mirror the app
// flow (asset → price → target → projection → dashboard).
const SLIDES: Slide[] = [
  {
    icon: PartyPopper,
    accent: "var(--nb-pink)",
    title: "Selamat datang di Monvu",
    body: "Semua asetmu dalam satu pandangan. Kenalan singkat dengan alurnya dulu — cuma butuh 30 detik.",
  },
  {
    icon: Wallet,
    accent: "var(--nb-purple)",
    title: "1. Tambah aset",
    body: "Catat semua yang kamu punya: tabungan, emas, saham, reksa dana, sampai uang cash.",
  },
  {
    icon: RefreshCw,
    accent: "var(--nb-green)",
    title: "2. Perbarui harga",
    body: "Update nilai asetmu secara berkala biar total kekayaanmu selalu akurat dan terkini.",
  },
  {
    icon: Target,
    accent: "var(--nb-pink)",
    title: "3. Tambah target",
    body: "Tetapkan tujuan finansial — DP rumah, dana darurat, liburan — lalu alokasikan asetmu ke sana.",
  },
  {
    icon: TrendingUp,
    accent: "var(--nb-purple)",
    title: "4. Lihat proyeksi",
    body: "Monvu memperkirakan kapan tiap targetmu tercapai berdasarkan progres dan kontribusimu.",
  },
  {
    icon: LayoutDashboard,
    accent: "var(--nb-green)",
    title: "5. Pantau di dashboard",
    body: "Ringkasan kekayaan dan progres semua targetmu ada di dashboard. Selesai — ayo mulai!",
  },
];

const SWIPE_THRESHOLD = 50; // px

// Inner carousel. Mounted only while the dialog is open (base-ui unmounts the
// portal on close), so slide index resets to 0 on every open without an effect.
function Carousel({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const last = SLIDES.length - 1;
  const slide = SLIDES[index];
  const Icon = slide.icon;

  const goNext = () => (index === last ? onClose() : setIndex((i) => i + 1));
  const goPrev = () => setIndex((i) => Math.max(0, i - 1));

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    setTouchStartX(null);
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    // Swipe left → next, right → prev. Don't finish (close) via swipe — the
    // "Mulai" button is the only deliberate exit on the last slide.
    if (dx < 0 && index < last) setIndex((i) => i + 1);
    else if (dx > 0 && index > 0) setIndex((i) => i - 1);
  };

  return (
    <div
      onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
      onTouchEnd={handleTouchEnd}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") goNext();
        else if (e.key === "ArrowLeft") goPrev();
      }}
    >
      <div className="flex flex-col items-center gap-4 px-2 pt-2 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[var(--nb-border)] [box-shadow:3px_3px_0px_var(--nb-shadow)]"
          style={{
            backgroundColor: `color-mix(in srgb, ${slide.accent} 15%, transparent)`,
          }}
        >
          <Icon className="h-8 w-8" style={{ color: slide.accent }} />
        </div>

        {/* min-h keeps the dialog height steady as body copy length varies. */}
        <div className="flex min-h-[6.5rem] flex-col gap-2">
          <DialogTitle className="font-display text-xl font-extrabold">
            {slide.title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-[var(--nb-text-muted)]">
            {slide.body}
          </DialogDescription>
        </div>
      </div>

      {/* Dots — also clickable to jump. */}
      <div className="mt-2 flex justify-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-2 rounded-full border-2 border-[var(--nb-border)] transition-all duration-150",
              i === index
                ? "w-6 bg-[var(--nb-pink)]"
                : "w-2 bg-[var(--nb-surface2)] hover:bg-[var(--nb-pink)]/40"
            )}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={goPrev}
          // Hidden (not just disabled) on slide 0 to keep the row balanced.
          className={cn(index === 0 && "pointer-events-none opacity-0")}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <Button onClick={goNext}>
          {index === last ? "Mulai" : "Lanjut"}
          {index < last && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

// Mounted once in AppShell. Owns when the tour shows: auto once per browser for
// signed-in users, and on demand via openOnboarding() for everyone.
export function OnboardingModal() {
  const { isGuest } = useData();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [manualOpen, setManualOpen] = useState(false);

  const seen = useSyncExternalStore(
    useCallback((onChange: () => void) => {
      window.addEventListener("storage", onChange); // cross-tab
      window.addEventListener(SEEN_EVENT, onChange); // same-tab
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(SEEN_EVENT, onChange);
      };
    }, []),
    // No user yet → treat as seen (don't auto-show until we know who it is).
    () => !userId || localStorage.getItem(seenKeyFor(userId)) === "1",
    // SSR / first paint: assume seen so the modal never flashes during hydration;
    // the real value is read right after, opening it if genuinely unseen.
    () => true
  );

  useEffect(() => {
    const open = () => setManualOpen(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  // Auto-show only for signed-in users ("ketika berhasil login"); guests reach
  // it via the Panduan menu instead.
  const open = manualOpen || (!!userId && !seen && !isGuest);

  const handleOpenChange = (next: boolean) => {
    if (next) return; // we never open via a trigger, only programmatically
    if (userId && !seen) {
      localStorage.setItem(seenKeyFor(userId), "1");
      window.dispatchEvent(new Event(SEEN_EVENT));
    }
    setManualOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Carousel onClose={() => handleOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
