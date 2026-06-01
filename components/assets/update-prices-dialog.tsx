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
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Coins,
  LineChart,
  Landmark,
  ScrollText,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { getCategoryLabel, getEffectiveCategoryLabel } from "@/lib/calculations";
import { useData } from "@/lib/data-store";
import type { AssetCategory } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Display order for the per-asset categories in this modal. Cash is intentionally
// absent: its rupiah value is static, so editing it under "Update Harga" is noise
// — balance changes go through the asset's Edit form instead.
const EDITABLE_ORDER: AssetCategory[] = ["stock", "money_market", "obligasi", "custom"];

// Chip icons — mirror the filter icons on the assets page. Keyed by chip value
// ("all"/"gold" aren't categories, so this isn't keyed off AssetCategory).
const CHIP_ICONS: Record<string, LucideIcon> = {
  all: Wallet,
  gold: Coins,
  stock: LineChart,
  money_market: Landmark,
  obligasi: ScrollText,
  custom: Tag,
};

// Inner form remounted via `key` on open to seed inputs from current store data.
function UpdatePricesFields({ onClose }: { onClose: () => void }) {
  const { assets, goldPricePerGram, setGoldPricePerGram, setAssetCurrentValue } = useData();

  // Gold uses one global price. Per-asset editing covers everything whose value
  // drifts in the market; cash (and gold) are excluded.
  const editable = assets.filter((a) => a.category !== "gold" && a.category !== "cash");
  const hasGold = assets.some((a) => a.category === "gold");

  const [gold, setGold] = useState(String(goldPricePerGram));
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(editable.map((a) => [a.id, String(a.current_value)]))
  );

  // Chips: "Semua" + Emas (if any) + each editable category actually present.
  const presentCats = EDITABLE_ORDER.filter((c) => editable.some((a) => a.category === c));
  const chips: { value: string; label: string }[] = [
    { value: "all", label: "Semua" },
    ...(hasGold ? [{ value: "gold", label: "Emas" }] : []),
    ...presentCats.map((c) => ({ value: c, label: getCategoryLabel(c) })),
  ];
  // Only worth showing chips when there's more than one bucket to switch between.
  const showChips = chips.length > 2;

  const [filter, setFilter] = useState<string>("all");

  const showGold = hasGold && (filter === "all" || filter === "gold");
  const shownAssets = filter === "all" ? editable : editable.filter((a) => a.category === filter);

  const handleSave = () => {
    setGoldPricePerGram(Number(gold) || 0);
    // Save every edited asset, not just the currently-filtered view.
    editable.forEach((a) => {
      const raw = values[a.id];
      const v = Number(raw);
      if (raw !== "" && !Number.isNaN(v)) setAssetCurrentValue(a.id, v);
    });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Update Harga</DialogTitle>
        <DialogDescription>
          Perbarui harga emas global dan nilai sekarang tiap aset secara manual.
        </DialogDescription>
      </DialogHeader>

      {showChips && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => {
            const isActive = filter === c.value;
            const Icon = CHIP_ICONS[c.value];
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setFilter(c.value)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {c.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid min-w-0 gap-4 max-h-[60vh] overflow-y-auto pr-1">
        {showGold && (
          <div className="grid gap-1.5">
            <Label htmlFor="gold-price">Harga emas (Rp/gram)</Label>
            <Input
              id="gold-price"
              type="number"
              value={gold}
              onChange={(e) => setGold(e.target.value)}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Berlaku untuk semua aset emas (nilai sekarang = gram × harga ini).
            </p>
          </div>
        )}

        {shownAssets.length > 0 && (
          <div className="grid min-w-0 gap-2">
            <Label>Nilai sekarang per aset</Label>
            <div className="grid min-w-0 gap-2">
              {shownAssets.map((a) => (
                <div key={a.id} className="flex min-w-0 items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" title={a.name}>
                      {a.name}
                    </p>
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      {getEffectiveCategoryLabel(a.category, a.custom_category)}
                    </Badge>
                  </div>
                  <Input
                    type="number"
                    className="w-32 shrink-0 sm:w-40"
                    value={values[a.id] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [a.id]: e.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" onClick={onClose} />}>
          Batal
        </DialogClose>
        <Button onClick={handleSave}>Simpan</Button>
      </DialogFooter>
    </>
  );
}

export function UpdatePricesDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <UpdatePricesFields key={String(open)} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
