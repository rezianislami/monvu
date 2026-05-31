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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GoalInput } from "@/lib/data-store";
import type { Goal } from "@/lib/types";

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
            <Input
              id="goal-target"
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="goal-current">Terkumpul (Rp)</Label>
            <Input
              id="goal-current"
              type="number"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="goal-date">Tanggal Target</Label>
          <Input
            id="goal-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
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
