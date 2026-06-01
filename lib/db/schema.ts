import {
  pgTable,
  pgEnum,
  text,
  boolean,
  timestamp,
  bigint,
  doublePrecision,
  smallint,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────────────────────
// Better Auth core tables (model names singular: user/session/account/verification).
// Mirrors Better Auth 1.x default schema for email/password. Regenerate with
// `npx @better-auth/cli generate` if you change the auth config.
// ─────────────────────────────────────────────────────────────────────────────
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").$defaultFn(() => false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

// ─────────────────────────────────────────────────────────────────────────────
// App tables. Money values are stored as bigint (IDR has no cents). gold
// purchase/current are derived from gram × prices on the client, but we persist
// the raw inputs (quantity, buy_unit_price) + canonical values for portability.
// ─────────────────────────────────────────────────────────────────────────────
export const assetCategory = pgEnum("asset_category", [
  "gold",
  "stock",
  "money_market",
  "obligasi",
  "custom",
]);
export const goalCategory = pgEnum("goal_category", [
  "kpr",
  "car",
  "emergency",
  "pension",
  "custom",
]);

export const asset = pgTable("asset", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: assetCategory("category").notNull(),
  // User-typed category label when category = 'custom'.
  customCategory: text("custom_category"),
  purchaseValue: bigint("purchase_value", { mode: "number" }).notNull().default(0),
  currentValue: bigint("current_value", { mode: "number" }).notNull().default(0),
  quantity: doublePrecision("quantity"), // gold: gram; null for stock/money_market
  unit: text("unit"),
  buyUnitPrice: bigint("buy_unit_price", { mode: "number" }), // gold: per gram
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const goal = pgTable("goal", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("🎯"),
  category: goalCategory("category").notNull(),
  targetAmount: bigint("target_amount", { mode: "number" }).notNull().default(0),
  currentAmount: bigint("current_amount", { mode: "number" }).notNull().default(0),
  targetDate: text("target_date").notNull(), // YYYY-MM-DD (matches the client)
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});

// User-submitted feedback from the sidebar. `sentiment` is an optional 1–5
// emoji scale (1 = 😞 … 5 = 🤩); message is required. We keep rows even after a
// user is deleted is NOT desired here — feedback is per-user and cascades, same
// as the rest of the app tables, to avoid orphaned PII.
export const feedbackCategory = pgEnum("feedback_category", [
  "saran",
  "masalah",
  "pujian",
]);

export const feedback = pgTable("feedback", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  category: feedbackCategory("category").notNull(),
  // Nullable: emoji rating is optional, only the message is required.
  sentiment: smallint("sentiment"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});

// One row per user: the manual global gold price (Rp/gram).
export const userSettings = pgTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  goldPricePerGram: bigint("gold_price_per_gram", { mode: "number" })
    .notNull()
    .default(2774000),
  // Last time the price was updated via PUT /api/settings.
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});
