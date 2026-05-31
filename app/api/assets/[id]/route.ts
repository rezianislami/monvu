import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { asset } from "@/lib/db/schema";
import { getSessionUser, json, unauthorized, badRequest, notFound } from "@/lib/api/http";
import { parseAssetInput, assetToApi } from "@/lib/api/validators";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return unauthorized();
  const { id } = await ctx.params;

  const body = await req.json().catch(() => null);
  const parsed = parseAssetInput(body);
  if (!parsed.ok) return badRequest(parsed.error);

  const [row] = await db
    .update(asset)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(asset.id, id), eq(asset.userId, user.id)))
    .returning();

  if (!row) return notFound();
  return json(assetToApi(row));
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return unauthorized();
  const { id } = await ctx.params;

  const [row] = await db
    .delete(asset)
    .where(and(eq(asset.id, id), eq(asset.userId, user.id)))
    .returning();

  if (!row) return notFound();
  return json({ success: true });
}
