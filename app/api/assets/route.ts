import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { asset } from "@/lib/db/schema";
import { getSessionUser, json, unauthorized, badRequest } from "@/lib/api/http";
import { parseAssetInput, assetToApi } from "@/lib/api/validators";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return unauthorized();

  const rows = await db
    .select()
    .from(asset)
    .where(eq(asset.userId, user.id))
    .orderBy(desc(asset.createdAt));

  return json(rows.map(assetToApi));
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = parseAssetInput(body);
  if (!parsed.ok) return badRequest(parsed.error);

  const [row] = await db
    .insert(asset)
    .values({ id: randomUUID(), userId: user.id, ...parsed.data })
    .returning();

  return json(assetToApi(row), 201);
}
