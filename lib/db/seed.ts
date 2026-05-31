import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "./schema";
import { mockAssets, mockGoals } from "../mock-data";
import { GOLD_PRICE_PER_GRAM } from "../system-prices";

// Run with: npm run db:seed
// Idempotent — wipes the demo user (cascades) and re-creates everything.

const DEMO_EMAIL = "demo@monvu.test";
const DEMO_PASSWORD = "password123";
const DEMO_NAME = "Nassya";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const client = postgres(connectionString);
const db = drizzle(client, { schema });

// Local auth instance so the demo user gets a properly hashed password.
const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

function dateAt(day: string): Date {
  // UTC midnight so the stored timestamp's date matches the YYYY-MM-DD value
  // (local midnight would shift the day back in UTC+ timezones).
  return new Date(`${day}T00:00:00Z`);
}

async function main() {
  // Idempotency: removing the user cascades to assets/goals/settings/sessions.
  await db.delete(schema.user).where(eq(schema.user.email, DEMO_EMAIL));

  await auth.api.signUpEmail({
    body: { email: DEMO_EMAIL, password: DEMO_PASSWORD, name: DEMO_NAME },
  });

  const [u] = await db.select().from(schema.user).where(eq(schema.user.email, DEMO_EMAIL));
  if (!u) throw new Error("Failed to create demo user");

  await db.insert(schema.asset).values(
    mockAssets.map((a) => ({
      id: randomUUID(),
      userId: u.id,
      name: a.name,
      category: a.category,
      purchaseValue: a.purchase_value,
      currentValue: a.current_value,
      quantity: a.quantity ?? null,
      unit: a.unit ?? null,
      buyUnitPrice: a.buy_unit_price ?? null,
      createdAt: dateAt(a.created_at),
      updatedAt: dateAt(a.updated_at),
    }))
  );

  await db.insert(schema.goal).values(
    mockGoals.map((g) => ({
      id: randomUUID(),
      userId: u.id,
      name: g.name,
      icon: g.icon,
      category: g.category,
      targetAmount: g.target_amount,
      currentAmount: g.current_amount,
      targetDate: g.target_date,
    }))
  );

  await db
    .insert(schema.userSettings)
    .values({ userId: u.id, goldPricePerGram: GOLD_PRICE_PER_GRAM });

  console.log(`✅ Seeded.\n   Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`   ${mockAssets.length} assets, ${mockGoals.length} goals.`);

  await client.end();
}

main().catch(async (err) => {
  console.error("Seed failed:", err);
  await client.end().catch(() => {});
  process.exit(1);
});
