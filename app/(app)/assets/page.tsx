"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Coins,
  LineChart,
  Landmark,
  ScrollText,
  Banknote,
  Tag,
  TrendingUp,
  TrendingDown,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AssetFormDialog } from "@/components/assets/asset-form-dialog";
import { UpdatePricesDialog } from "@/components/assets/update-prices-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { InfoCallout } from "@/components/common/info-callout";
import { useData } from "@/lib/data-store";
import {
  formatRupiah,
  formatDate,
  calculateProfitLoss,
  calculateReturn,
  calculateTotalModal,
  calculateTotalCurrentValue,
  getCategoryLabel,
  getEffectiveCategoryLabel,
  getCategoryColor,
} from "@/lib/calculations";
import type { Asset, AssetCategory } from "@/lib/types";

const CATEGORIES: { value: AssetCategory | "all"; label: string; icon: typeof Wallet }[] = [
  { value: "all", label: "Semua", icon: Wallet },
  { value: "gold", label: "Emas", icon: Coins },
  { value: "stock", label: "Saham", icon: LineChart },
  { value: "money_market", label: "Pasar Uang", icon: Landmark },
  { value: "cash", label: "Uang Cash", icon: Banknote },
  { value: "obligasi", label: "Obligasi", icon: ScrollText },
  { value: "custom", label: "Custom", icon: Tag },
];

type SortKey = "name" | "modal" | "current" | "pl" | "return" | "updated";

function sortValue(a: Asset, key: SortKey): string | number {
  switch (key) {
    case "name":
      return a.name.toLowerCase();
    case "modal":
      return a.purchase_value;
    case "current":
      return a.current_value;
    case "pl":
      return a.current_value - a.purchase_value;
    case "return":
      return calculateReturn(a);
    case "updated":
      return a.updated_at;
  }
}

export default function AssetsPage() {
  const { assets, goldPricePerGram, pricesUpdatedAt, addAsset, updateAsset, deleteAsset, isGuest } =
    useData();
  const router = useRouter();
  const [filter, setFilter] = useState<AssetCategory | "all">("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [deleting, setDeleting] = useState<Asset | null>(null);
  const [pricesOpen, setPricesOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const byCategory = filter === "all" ? assets : assets.filter((a) => a.category === filter);
  const q = query.trim().toLowerCase();
  const filtered = [...byCategory]
    .filter((a) => a.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  // Sortable column header (plain function, not a component, to avoid re-mounts).
  const sortTh = (label: string, key: SortKey, align: "left" | "right" = "right") => (
    <th
      className={`py-3 px-4 text-muted-foreground font-medium ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <button
        type="button"
        onClick={() => toggleSort(key)}
        className={`inline-flex items-center gap-1 transition-colors hover:text-foreground ${
          align === "right" ? "flex-row-reverse" : ""
        } ${sortKey === key ? "text-foreground" : ""}`}
      >
        {label}
        {sortKey === key &&
          (sortDir === "asc" ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          ))}
      </button>
    </th>
  );

  // Per-category summary cards (always over the full set, not the filter).
  // Custom assets are heterogeneous so they're excluded from the class summary.
  const categorySummary = (
    ["gold", "stock", "money_market", "cash", "obligasi"] as AssetCategory[]
  ).map((cat) => {
    const items = assets.filter((a) => a.category === cat);
    const modal = calculateTotalModal(items);
    const current = calculateTotalCurrentValue(items);
    const pl = current - modal;
    const ret = modal === 0 ? 0 : (pl / modal) * 100;
    return { cat, count: items.length, current, pl, ret };
  });

  const openAdd = () => {
    // Guests can browse but not write — send them to register instead.
    if (isGuest) {
      router.push("/signup");
      return;
    }
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (asset: Asset) => {
    setEditing(asset);
    setFormOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Aset</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola dan pantau seluruh aset Anda per kategori
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Harga emas:{" "}
            <span className="text-foreground font-medium">
              {formatRupiah(goldPricePerGram)}/gram
            </span>{" "}
            · Update harga terakhir:{" "}
            <span className="text-foreground font-medium">{formatDate(pricesUpdatedAt)}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPricesOpen(true)}>
            <RefreshCw className="h-4 w-4" />
            Update Harga
          </Button>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Tambah Aset
          </Button>
        </div>
      </div>

      {/* Price-update tip — dismissible, persisted per browser */}
      <InfoCallout storageKey="monvu.assets.priceTip">
        <strong>Klik &quot;Update Harga&quot; secara berkala</strong> biar profit/loss-mu akurat.
        Lihat harga terkini di aplikasi tempat kamu beli (Bibit, Stockbit, Pluang). Emas update
        otomatis.
      </InfoCallout>

      {/* Category summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {categorySummary.map((c) => (
          <Card key={c.cat} className="glass-card border-border/50 rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getCategoryColor(c.cat) }}
                  />
                  <span className="text-sm font-medium">{getCategoryLabel(c.cat)}</span>
                </div>
                <span className="text-xs text-muted-foreground">{c.count} aset</span>
              </div>
              <p className="text-xl font-bold mt-3">{formatRupiah(c.current)}</p>
              <p
                className={`text-xs font-medium mt-1 ${
                  c.pl >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {c.pl >= 0 ? "+" : ""}
                {formatRupiah(c.pl)} ({c.ret >= 0 ? "+" : ""}
                {c.ret.toFixed(1)}%)
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter + Table */}
      <Card className="glass-card border-border/50 rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base font-semibold">Daftar Aset</CardTitle>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => {
                const isActive = filter === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => setFilter(c.value)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <c.icon className="h-3.5 w-3.5" />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama aset..."
              className="pl-8 sm:max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {sortTh("Aset", "name", "left")}
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Kategori</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Jumlah</th>
                  {sortTh("Modal", "modal")}
                  {sortTh("Nilai Saat Ini", "current")}
                  {sortTh("Profit/Loss", "pl")}
                  {sortTh("Return", "return")}
                  {sortTh("Terakhir Update", "updated")}
                  <th className="w-10 py-3 px-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((asset) => {
                  const pl = calculateProfitLoss(asset);
                  const ret = calculateReturn(asset);
                  return (
                    <tr
                      key={asset.id}
                      className="border-b border-border/30 hover:bg-accent/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">
                        <span className="block max-w-[180px] truncate" title={asset.name}>
                          {asset.name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="secondary"
                          className="text-xs font-normal max-w-[140px] truncate"
                          title={getEffectiveCategoryLabel(asset.category, asset.custom_category)}
                        >
                          {getEffectiveCategoryLabel(asset.category, asset.custom_category)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {asset.quantity != null ? `${asset.quantity} ${asset.unit ?? ""}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {formatRupiah(asset.purchase_value)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatRupiah(asset.current_value)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${
                          pl >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1 justify-end">
                          {pl >= 0 ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                          )}
                          {pl >= 0 ? "+" : ""}
                          {formatRupiah(pl)}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${
                          ret >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {ret >= 0 ? "+" : ""}
                        {ret.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground whitespace-nowrap">
                        {formatDate(asset.updated_at)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon-sm" />}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(asset)}>
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleting(asset)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-0">
                      <EmptyState
                        icon={Wallet}
                        title={
                          assets.length === 0
                            ? "Belum ada aset"
                            : "Tidak ada aset pada kategori ini"
                        }
                        description={
                          assets.length === 0
                            ? 'Klik "Tambah Aset" untuk menambahkan aset pertamamu.'
                            : "Coba pilih kategori lain atau ubah filter."
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit dialog */}
      <AssetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        asset={editing}
        onSubmit={(data) => {
          if (editing) updateAsset(editing.id, data);
          else addAsset(data);
        }}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Hapus aset?"
        description={
          deleting ? `"${deleting.name}" akan dihapus dari portofolio.` : undefined
        }
        onConfirm={() => deleting && deleteAsset(deleting.id)}
      />

      {/* Manual price update */}
      <UpdatePricesDialog open={pricesOpen} onOpenChange={setPricesOpen} />
    </div>
  );
}
