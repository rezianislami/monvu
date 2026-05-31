export type AssetCategory = "gold" | "stock" | "money_market" | "obligasi" | "custom";

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  // User-typed label when category === "custom".
  custom_category?: string;
  // Canonical money values. For money_market these are entered directly.
  // For gold/stock they are DERIVED on read from quantity × prices (see
  // resolveAsset in system-prices.ts), so stored raw values may be 0.
  purchase_value: number;
  current_value: number;
  // gold: gram, stock: lot. Undefined for money_market.
  quantity?: number;
  unit?: string;
  // gold: harga per gram saat beli; stock: harga per lot saat beli.
  buy_unit_price?: number;
  created_at: string;
  // Tanggal terakhir aset diubah (create/edit/update nilai). Format YYYY-MM-DD.
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  asset_id: string;
  price: number;
  recorded_at: string;
}

export interface Goal {
  id: string;
  name: string;
  icon: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: "kpr" | "car" | "emergency" | "pension" | "custom";
}

export interface Liability {
  id: string;
  name: string;
  remaining_balance: number;
}

export interface Transaction {
  id: string;
  asset_id: string;
  asset_name: string;
  type: "buy" | "sell";
  amount: number;
  date: string;
}

export interface NetWorthHistory {
  month: string;
  value: number;
}

export interface MonthlyReport {
  month: string;
  totalAsset: number;
  profitLoss: number;
  netWorth: number;
  goalProgress: number;
}
