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
import { formatRupiah, getCategoryLabel } from "@/lib/calculations";
import { useData, type AssetInput } from "@/lib/data-store";
import type { Asset, AssetCategory } from "@/lib/types";

const CATEGORIES: AssetCategory[] = [
  "gold",
  "stock",
  "money_market",
  "cash",
  "obligasi",
  "custom",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
  onSubmit: (data: AssetInput) => void;
}

// Inner form initialises state directly from props; remounted via `key` on each
// open, so there's no setState-in-effect to sync props → state.
function AssetFields({
  asset,
  onSubmit,
  onCancel,
}: {
  asset?: Asset | null;
  onSubmit: (data: AssetInput) => void;
  onCancel: () => void;
}) {
  const { goldPricePerGram } = useData();
  const isEdit = Boolean(asset);

  const [name, setName] = useState(asset?.name ?? "");
  const [category, setCategory] = useState<AssetCategory>(asset?.category ?? "gold");
  const [customCategory, setCustomCategory] = useState(asset?.custom_category ?? "");
  // gold inputs
  const [quantity, setQuantity] = useState(asset?.quantity ? String(asset.quantity) : "");
  const [buyUnitPrice, setBuyUnitPrice] = useState(
    asset?.buy_unit_price ? String(asset.buy_unit_price) : ""
  );
  // stock / money_market inputs (modal + nilai sekarang, direct)
  const [purchase, setPurchase] = useState(
    asset && asset.category !== "gold" ? String(asset.purchase_value) : ""
  );
  const [current, setCurrent] = useState(
    asset && asset.category !== "gold" ? String(asset.current_value) : ""
  );

  const isGold = category === "gold";
  // Cash has no gain/loss — a single amount, not a modal/nilai pair.
  const isCash = category === "cash";

  // Gold derived preview from the live global price.
  const qtyNum = Number(quantity) || 0;
  const buyNum = Number(buyUnitPrice) || 0;
  const goldModal = qtyNum * buyNum;
  const goldCurrent = qtyNum * goldPricePerGram;
  const goldPl = goldCurrent - goldModal;

  const valid =
    name.trim() !== "" &&
    (category === "custom" ? customCategory.trim() !== "" : true) &&
    (isGold
      ? quantity !== "" && buyUnitPrice !== ""
      : isCash
      ? current !== ""
      : purchase !== "" && current !== "");

  const handleSubmit = () => {
    if (!valid) return;
    if (isGold) {
      onSubmit({
        name: name.trim(),
        category: "gold",
        quantity: qtyNum,
        unit: "gram",
        buy_unit_price: buyNum,
        purchase_value: 0, // derived on read
        current_value: 0, // derived on read
      });
    } else {
      // Stock symbols normalized to uppercase for tidy display.
      const finalName = category === "stock" ? name.trim().toUpperCase() : name.trim();
      // Cash: the single amount is both modal and nilai sekarang (P/L = 0).
      const currentVal = Number(current) || 0;
      onSubmit({
        name: finalName,
        category,
        custom_category: category === "custom" ? customCategory.trim() : undefined,
        purchase_value: isCash ? currentVal : Number(purchase) || 0,
        current_value: currentVal,
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Aset" : "Tambah Aset"}</DialogTitle>
        <DialogDescription>
          {isEdit ? "Perbarui detail aset Anda." : "Tambahkan aset baru ke portofolio."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label>Kategori</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as AssetCategory)}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v) => getCategoryLabel(v as AssetCategory)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {getCategoryLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {category === "custom" && (
          <div className="grid gap-1.5">
            <Label htmlFor="custom-category">Nama Kategori</Label>
            <Input
              id="custom-category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="mis. Crypto, P2P Lending"
            />
          </div>
        )}

        <div className="grid gap-1.5">
          <Label htmlFor="asset-name">{category === "stock" ? "Kode Saham" : "Nama"}</Label>
          <Input
            id="asset-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              category === "stock"
                ? "mis. BBCA"
                : category === "gold"
                ? "mis. Antam 10 gram"
                : category === "cash"
                ? "mis. Tabungan BCA, Dompet"
                : "mis. Bibit RDPU"
            }
          />
        </div>

        {isGold ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="asset-qty">Gram dibeli</Label>
                <Input
                  id="asset-qty"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="asset-buy">Harga/gram beli (Rp)</Label>
                <CurrencyInput
                  id="asset-buy"
                  value={buyUnitPrice}
                  onValueChange={setBuyUnitPrice}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Derived preview from the live global gold price */}
            <div className="rounded-xl bg-secondary/40 p-3 text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total modal</span>
                <span className="font-medium">{formatRupiah(goldModal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Harga emas sekarang</span>
                <span className="font-medium">{formatRupiah(goldPricePerGram)}/gram</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nilai sekarang</span>
                <span className="font-medium">{formatRupiah(goldCurrent)}</span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-1.5">
                <span className="text-muted-foreground">Profit / Loss</span>
                <span
                  className={`font-semibold ${
                    goldPl >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {goldPl >= 0 ? "+" : ""}
                  {formatRupiah(goldPl)}
                </span>
              </div>
            </div>
          </>
        ) : isCash ? (
          <div className="grid gap-1.5">
            <Label htmlFor="asset-amount">Jumlah (Rp)</Label>
            <CurrencyInput
              id="asset-amount"
              value={current}
              onValueChange={setCurrent}
              placeholder="0"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="asset-modal">Modal (Rp)</Label>
              <CurrencyInput
                id="asset-modal"
                value={purchase}
                onValueChange={setPurchase}
                placeholder="0"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="asset-current">Nilai Saat Ini (Rp)</Label>
              <CurrencyInput
                id="asset-current"
                value={current}
                onValueChange={setCurrent}
                placeholder="0"
              />
            </div>
          </div>
        )}
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

export function AssetFormDialog({ open, onOpenChange, asset, onSubmit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <AssetFields
          key={`${asset?.id ?? "new"}-${open}`}
          asset={asset}
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
