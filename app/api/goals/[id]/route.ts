import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { goal } from "@/lib/db/schema";
import { getSessionUser, json, unauthorized, badRequest, notFound } from "@/lib/api/http";
import { parseGoalInput, goalToApi } from "@/lib/api/validators";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return unauthorized();
  const { id } = await ctx.params;

  const body = await req.json().catch(() => null);
  const parsed = parseGoalInput(body);
  if (!parsed.ok) return badRequest(parsed.error);

  const [row] = await db
    .update(goal)
    .set(parsed.data)
    .where(and(eq(goal.id, id), eq(goal.userId, user.id)))
    .returning();

  if (!row) return notFound();
  return json(goalToApi(row));
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return unauthorized();
  const { id } = await ctx.params;

  const [row] = await db
    .delete(goal)
    .where(and(eq(goal.id, id), eq(goal.userId, user.id)))
    .returning();

  if (!row) return notFound();
  return json({ success: true });
}
