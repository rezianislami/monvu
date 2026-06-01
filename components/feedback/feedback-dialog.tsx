"use client";

import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useData, type FeedbackInput } from "@/lib/data-store";

type Category = FeedbackInput["category"];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "saran", label: "💡 Saran" },
  { value: "masalah", label: "🐞 Laporan masalah" },
  { value: "pujian", label: "❤️ Pujian" },
];

// Emoji = optional sentiment (1–5). The text is the signal we actually act on.
const SENTIMENTS: { value: number; emoji: string; label: string }[] = [
  { value: 1, emoji: "😞", label: "Buruk" },
  { value: 2, emoji: "😐", label: "Kurang" },
  { value: 3, emoji: "🙂", label: "Oke" },
  { value: 4, emoji: "😀", label: "Bagus" },
  { value: 5, emoji: "🤩", label: "Keren" },
];

function categoryLabel(value: Category): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

// Remounted via `key` on each open so state initialises fresh — same trick as
// GoalFormDialog, avoids syncing props → state in an effect.
function FeedbackFields({ onDone }: { onDone: () => void }) {
  const { submitFeedback } = useData();

  const [category, setCategory] = useState<Category>("saran");
  const [sentiment, setSentiment] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const valid = message.trim() !== "";

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    const ok = await submitFeedback({ category, sentiment, message: message.trim() });
    setSubmitting(false);
    if (ok) onDone();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Saran & Masukan</DialogTitle>
        <DialogDescription>
          Punya ide, menemukan masalah, atau sekadar mau bilang sesuatu? Kami baca semuanya.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label>Bagaimana pengalamanmu?</Label>
          <div className="flex justify-between gap-1.5">
            {SENTIMENTS.map((s) => {
              const active = sentiment === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  // Click the active emoji again to clear (rating stays optional).
                  onClick={() => setSentiment(active ? null : s.value)}
                  aria-label={s.label}
                  aria-pressed={active}
                  title={s.label}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-0.5 rounded-xl border-2 py-2 text-2xl transition-all duration-100",
                    active
                      ? "border-[var(--nb-border)] bg-[var(--nb-pink)]/10 [box-shadow:2px_2px_0px_var(--nb-shadow)]"
                      : "border-transparent opacity-60 hover:opacity-100 hover:bg-[var(--nb-surface2)]"
                  )}
                >
                  <span className={cn(!active && "grayscale")}>{s.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label>Tipe</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v) => categoryLabel(v as Category)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="feedback-message">Ceritakan lebih detail</Label>
          <Textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            placeholder="Tulis saran, masalah, atau apresiasimu di sini..."
          />
        </div>
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" disabled={submitting} />}>
          Batal
        </DialogClose>
        <Button onClick={handleSubmit} disabled={!valid || submitting}>
          {submitting ? "Mengirim..." : "Kirim"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function FeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <FeedbackFields key={String(open)} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
