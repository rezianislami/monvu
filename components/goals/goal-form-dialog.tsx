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
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useData, type GoalInput } from "@/lib/data-store";
import type { Goal } from "@/lib/types";
import { formatRupiah, calculateTotalCurrentValue } from "@/lib/calculations";

type GoalCategory = Goal["category"];

const GOAL_CATEGORIES: { value: GoalCategory; label: string; icon: string }[] = [
  { value: "kpr", label: "KPR", icon: "🏠" },
  { value: "car", label: "Mobil", icon: "🚗" },
  { value: "emergency", label: "Dana Darurat", icon: "🛡️" },
  { value: "pension", label: "Pensiun", icon: "🌴" },
  { value: "custom", label: "Custom", icon: "🎯" },
];

function categoryLabel(value: GoalCategory): string {
  return GOAL_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
  onSubmit: (data: GoalInput) => void;
}

// Inner form initialises state directly from props; remounted via `key` on each
// open so no setState-in-effect is needed to sync props → state.
function GoalFields({
  goal,
  onSubmit,
  onCancel,
}: {
  goal?: Goal | null;
  onSubmit: (data: GoalInput) => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(goal);

  const [name, setName] = useState(goal?.name ?? "");
  const [icon, setIcon] = useState(goal?.icon ?? "🎯");
  const [category, setCategory] = useState<GoalCategory>(goal?.category ?? "custom");
  const [target, setTarget] = useState(goal ? String(goal.target_amount) : "");
  const [current, setCurrent] = useState(goal ? String(goal.current_amount) : "");
  const [targetDate, setTargetDate] = useState(goal?.target_date ?? "");

  // Allocation pool (Plan B): "terkumpul" is money allocated from total assets,
  // shared across all goals. Exclude the goal being edited so its own amount
  // doesn't count against itself. Over-allocation is a soft warning, not a block
  // — the pool can shrink (market drop, asset deleted) below what's allocated.
  const { assets, goals } = useData();
  const totalAssets = calculateTotalCurrentValue(assets);
  const allocatedElsewhere = goals
    .filter((g) => g.id !== goal?.id)
    .reduce((sum, g) => sum + g.current_amount, 0);
  const remainingPool = totalAssets - allocatedElsewhere;
  const currentNum = Number(current) || 0;
  const overAllocated = currentNum > remainingPool;

  // Guardrails (soft): flag a past target date and a terkumpul above the target.
  const today = new Date().toISOString().slice(0, 10);
  const overTarget = target !== "" && currentNum > (Number(target) || 0);
  const pastDate = targetDate !== "" && targetDate < today;

  const valid = name.trim() !== "" && target !== "" && targetDate !== "";

  // Picking a category auto-fills its emoji.
  const handleCategoryChange = (v: GoalCategory) => {
    setCategory(v);
    const preset = GOAL_CATEGORIES.find((c) => c.value === v)?.icon;
    if (preset) setIcon(preset);
  };

  const handleSubmit = () => {
    if (!valid) return;
    onSubmit({
      name: name.trim(),
      icon: icon.trim() || "🎯",
      category,
      target_amount: Number(target) || 0,
      current_amount: Number(current) || 0,
      target_date: targetDate,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Target" : "Tambah Target"}</DialogTitle>
        <DialogDescription>
          {isEdit ? "Perbarui detail target finansial." : "Buat target finansial baru."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="goal-name">Nama</Label>
          <Input
            id="goal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mis. Pelunasan KPR"
          />
        </div>

        <div className="grid gap-1.5">
          <Label>Kategori</Label>
          <Select
            value={category}
            onValueChange={(v) => handleCategoryChange(v as GoalCategory)}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v) => {
                  const c = GOAL_CATEGORIES.find((x) => x.value === v);
                  return c ? `${c.icon} ${c.label}` : categoryLabel(v as GoalCategory);
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {GOAL_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.icon} {categoryLabel(c.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="goal-target">Target (Rp)</Label>
            <CurrencyInput
              id="goal-target"
              value={target}
              onValueChange={setTarget}
              placeholder="0"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="goal-current">Terkumpul (Rp)</Label>
            <CurrencyInput
              id="goal-current"
              value={current}
              onValueChange={setCurrent}
              placeholder="0"
            />
          </div>
        </div>

        {overTarget && (
          <p className="text-xs text-amber-500">
            Terkumpul melebihi target — target ini sudah tercapai.
          </p>
        )}

        {/* Allocation pool: how much of total assets is still free to assign */}
        <div className="grid gap-1.5 rounded-xl bg-secondary/40 p-3 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total aset</span>
            <span className="font-medium">{formatRupiah(totalAssets)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dialokasikan ke target lain</span>
            <span className="font-medium">{formatRupiah(allocatedElsewhere)}</span>
          </div>
          <div className="flex justify-between border-t border-border/50 pt-1.5">
            <span className="text-muted-foreground">Tersisa bisa dialokasikan</span>
            <span
              className={`font-semibold ${
                remainingPool < 0 ? "text-rose-400" : "text-foreground"
              }`}
            >
              {formatRupiah(remainingPool)}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1 justify-self-start"
            disabled={remainingPool <= 0}
            onClick={() => setCurrent(String(Math.max(0, Math.round(remainingPool))))}
          >
            Alokasikan Semua
          </Button>
          {overAllocated && (
            <p className="text-rose-400">
              Melebihi sisa sebesar {formatRupiah(currentNum - remainingPool)}. Tetap bisa
              disimpan, tapi total alokasi akan melampaui asetmu.
            </p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="goal-date">Tanggal Target</Label>
          <Input
            id="goal-date"
            type="date"
            min={today}
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
          {pastDate && (
            <p className="text-xs text-amber-500">
              Tanggal target sudah lewat — pilih tanggal di masa depan.
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" onClick={onCancel} />}>
          Batal
        </DialogClose>
        <Button onClick={handleSubmit} disabled={!valid}>
          {isEdit ? "Simpan" : "Tambah"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function GoalFormDialog({ open, onOpenChange, goal, onSubmit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <GoalFields
          key={`${goal?.id ?? "new"}-${open}`}
          goal={goal}
          onSubmit={(data) => {
            onSubmit(data);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
