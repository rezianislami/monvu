import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { getSessionUser, json, unauthorized, badRequest } from "@/lib/api/http";
import { GOLD_PRICE_PER_GRAM } from "@/lib/system-prices";

// Fallback when a user has no settings row yet (kept in sync with the system default).
const DEFAULT_GOLD_PRICE = GOLD_PRICE_PER_GRAM;

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return unauthorized();

  const [row] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, user.id));

  return json({
    gold_price_per_gram: row?.goldPricePerGram ?? DEFAULT_GOLD_PRICE,
    prices_updated_at: row?.updatedAt ? row.updatedAt.toISOString().slice(0, 10) : null,
  });
}

export async function PUT(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  const price =
    body && typeof body === "object" ? Number((body as Record<string, unknown>).gold_price_per_gram) : NaN;
  if (!Number.isFinite(price) || price < 0) return badRequest("Harga emas tidak valid");

  const now = new Date();
  const [row] = await db
    .insert(userSettings)
    .values({ userId: user.id, goldPricePerGram: price, updatedAt: now })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: { goldPricePerGram: price, updatedAt: now },
    })
    .returning();

  return json({
    gold_price_per_gram: row.goldPricePerGram,
    prices_updated_at: row.updatedAt.toISOString().slice(0, 10),
  });
}
