import { Asset, Goal } from "./types";

// Gold's purchase_value/current_value are placeholders (0) — derived on read by
// resolveAsset() from gram × prices (global gold price). Stock & money market
// store modal + nilai sekarang directly (updated manually).
export const mockAssets: Asset[] = [
  // Gold — quantity (gram) + buy price per gram. Current = gram × global price.
  {
    id: "asset-3",
    name: "Antam 10 gram",
    category: "gold",
    quantity: 10,
    unit: "gram",
    buy_unit_price: 1050000, // 10,500,000 / 10 gram
    purchase_value: 0,
    current_value: 0,
    created_at: "2023-06-10",
    updated_at: "2023-06-10",
  },
  {
    id: "asset-4",
    name: "Antam 25 gram",
    category: "gold",
    quantity: 25,
    unit: "gram",
    buy_unit_price: 1000000, // 25,000,000 / 25 gram
    purchase_value: 0,
    current_value: 0,
    created_at: "2022-12-01",
    updated_at: "2022-12-01",
  },
  // Stocks — modal & nilai sekarang entered directly (current updated manually).
  {
    id: "asset-5",
    name: "BBCA",
    category: "stock",
    purchase_value: 20000000,
    current_value: 26400000,
    created_at: "2024-02-15",
    updated_at: "2026-05-20",
  },
  {
    id: "asset-6",
    name: "BBRI",
    category: "stock",
    purchase_value: 15000000,
    current_value: 17850000,
    created_at: "2024-04-01",
    updated_at: "2026-05-20",
  },
  {
    id: "asset-7",
    name: "TLKM",
    category: "stock",
    purchase_value: 10000000,
    current_value: 8750000,
    created_at: "2024-05-20",
    updated_at: "2026-05-20",
  },
  // Money Market (Pasar Uang) — modal & nilai sekarang entered directly.
  {
    id: "asset-8",
    name: "Bibit RDPU",
    category: "money_market",
    purchase_value: 30000000,
    current_value: 31350000,
    created_at: "2024-01-01",
    updated_at: "2026-05-01",
  },
  {
    id: "asset-9",
    name: "Bareksa RDPU",
    category: "money_market",
    purchase_value: 20000000,
    current_value: 20900000,
    created_at: "2024-06-15",
    updated_at: "2026-05-01",
  },
];

export const mockGoals: Goal[] = [
  {
    id: "goal-1",
    name: "Pelunasan KPR",
    icon: "🏠",
    target_amount: 500000000,
    current_amount: 250000000,
    target_date: "2030-12-31",
    category: "kpr",
  },
  {
    id: "goal-2",
    name: "Beli Mobil",
    icon: "🚗",
    target_amount: 350000000,
    current_amount: 122500000,
    target_date: "2028-06-30",
    category: "car",
  },
  {
    id: "goal-3",
    name: "Dana Darurat",
    icon: "🛡️",
    target_amount: 100000000,
    current_amount: 80000000,
    target_date: "2027-12-31",
    category: "emergency",
  },
  {
    id: "goal-4",
    name: "Dana Pensiun",
    icon: "🌴",
    target_amount: 5000000000,
    current_amount: 750000000,
    target_date: "2050-01-01",
    category: "pension",
  },
];

