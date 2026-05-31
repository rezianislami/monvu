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
import { getEffectiveCategoryLabel } from "@/lib/calculations";
import { useData } from "@/lib/data-store";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Inner form remounted via `key` on open to seed inputs from current store data.
function UpdatePricesFields({ onClose }: { onClose: () => void }) {
  const { assets, goldPricePerGram, setGoldPricePerGram, setAssetCurrentValue } = useData();

  // Gold uses one global price; everything else has a per-asset current value.
  const nonGold = assets.filter((a) => a.category !== "gold");
  const hasGold = assets.some((a) => a.category === "gold");

  const [gold, setGold] = useState(String(goldPricePerGram));
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(nonGold.map((a) => [a.id, String(a.current_value)]))
  );

  const handleSave = () => {
    setGoldPricePerGram(Number(gold) || 0);
    nonGold.forEach((a) => {
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

      <div className="grid min-w-0 gap-4 max-h-[60vh] overflow-y-auto pr-1">
        {hasGold && (
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

        {nonGold.length > 0 && (
          <div className="grid min-w-0 gap-2">
            <Label>Nilai sekarang per aset</Label>
            <div className="grid min-w-0 gap-2">
              {nonGold.map((a) => (
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
