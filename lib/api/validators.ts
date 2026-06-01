import type { asset, goal, feedback } from "@/lib/db/schema";

type AssetRow = typeof asset.$inferSelect;
type GoalRow = typeof goal.$inferSelect;
type FeedbackRow = typeof feedback.$inferSelect;

const ASSET_CATEGORIES = ["gold", "stock", "money_market", "obligasi", "custom"] as const;
const GOAL_CATEGORIES = ["kpr", "car", "emergency", "pension", "custom"] as const;
const FEEDBACK_CATEGORIES = ["saran", "masalah", "pujian"] as const;

type AssetCategory = (typeof ASSET_CATEGORIES)[number];
type GoalCategory = (typeof GOAL_CATEGORIES)[number];
type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export interface AssetInputDb {
  name: string;
  category: AssetCategory;
  customCategory: string | null;
  purchaseValue: number;
  currentValue: number;
  quantity: number | null;
  unit: string | null;
  buyUnitPrice: number | null;
}

export interface GoalInputDb {
  name: string;
  icon: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export interface FeedbackInputDb {
  category: FeedbackCategory;
  sentiment: number | null;
  message: string;
}

type Parsed<T> = { ok: true; data: T } | { ok: false; error: string };

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "string" ? Number(v) : (v as number);
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

// Accepts the FE snake_case shape (purchase_value, current_value, buy_unit_price).
export function parseAssetInput(body: unknown): Parsed<AssetInputDb> {
  if (!isRecord(body)) return { ok: false, error: "Body harus berupa objek" };
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return { ok: false, error: "Nama wajib diisi" };
  if (!ASSET_CATEGORIES.includes(body.category as AssetCategory)) {
    return { ok: false, error: "Kategori tidak valid" };
  }
  const category = body.category as AssetCategory;
  const purchaseValue = toNumber(body.purchase_value) ?? 0;
  const currentValue = toNumber(body.current_value) ?? 0;
  const quantity = toNumber(body.quantity);
  const buyUnitPrice = toNumber(body.buy_unit_price);
  const unit = typeof body.unit === "string" && body.unit.trim() ? body.unit.trim() : null;
  const customCategory =
    typeof body.custom_category === "string" && body.custom_category.trim()
      ? body.custom_category.trim()
      : null;

  if (category === "gold" && (quantity === null || buyUnitPrice === null)) {
    return { ok: false, error: "Emas wajib punya gram & harga/gram" };
  }
  if (category === "custom" && !customCategory) {
    return { ok: false, error: "Nama kategori custom wajib diisi" };
  }
  return {
    ok: true,
    data: {
      name,
      category,
      customCategory: category === "custom" ? customCategory : null,
      purchaseValue,
      currentValue,
      quantity,
      unit,
      buyUnitPrice,
    },
  };
}

export function parseGoalInput(body: unknown): Parsed<GoalInputDb> {
  if (!isRecord(body)) return { ok: false, error: "Body harus berupa objek" };
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return { ok: false, error: "Nama wajib diisi" };
  if (!GOAL_CATEGORIES.includes(body.category as GoalCategory)) {
    return { ok: false, error: "Kategori tidak valid" };
  }
  const targetDate = typeof body.target_date === "string" ? body.target_date : "";
  if (!targetDate) return { ok: false, error: "Tanggal target wajib diisi" };
  const icon = typeof body.icon === "string" && body.icon.trim() ? body.icon.trim() : "🎯";

  return {
    ok: true,
    data: {
      name,
      icon,
      category: body.category as GoalCategory,
      targetAmount: toNumber(body.target_amount) ?? 0,
      currentAmount: toNumber(body.current_amount) ?? 0,
      targetDate,
    },
  };
}

export function parseFeedbackInput(body: unknown): Parsed<FeedbackInputDb> {
  if (!isRecord(body)) return { ok: false, error: "Body harus berupa objek" };
  if (!FEEDBACK_CATEGORIES.includes(body.category as FeedbackCategory)) {
    return { ok: false, error: "Kategori tidak valid" };
  }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return { ok: false, error: "Pesan wajib diisi" };
  if (message.length > 2000) return { ok: false, error: "Pesan maksimal 2000 karakter" };

  // sentiment is optional; when present it must be an integer 1–5.
  const rawSentiment = toNumber(body.sentiment);
  let sentiment: number | null = null;
  if (rawSentiment !== null) {
    if (!Number.isInteger(rawSentiment) || rawSentiment < 1 || rawSentiment > 5) {
      return { ok: false, error: "Sentiment harus antara 1–5" };
    }
    sentiment = rawSentiment;
  }

  return {
    ok: true,
    data: { category: body.category as FeedbackCategory, sentiment, message },
  };
}

// ── DB row → FE snake_case shape ─────────────────────────────────────────────
export function assetToApi(row: AssetRow) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    custom_category: row.customCategory ?? undefined,
    purchase_value: row.purchaseValue,
    current_value: row.currentValue,
    quantity: row.quantity ?? undefined,
    unit: row.unit ?? undefined,
    buy_unit_price: row.buyUnitPrice ?? undefined,
    created_at: row.createdAt.toISOString().slice(0, 10),
    updated_at: row.updatedAt.toISOString().slice(0, 10),
  };
}

export function goalToApi(row: GoalRow) {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    category: row.category,
    target_amount: row.targetAmount,
    current_amount: row.currentAmount,
    target_date: row.targetDate,
  };
}

export function feedbackToApi(row: FeedbackRow) {
  return {
    id: row.id,
    category: row.category,
    sentiment: row.sentiment ?? undefined,
    message: row.message,
    created_at: row.createdAt.toISOString(),
  };
}
