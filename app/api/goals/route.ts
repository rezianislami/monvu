import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { goal } from "@/lib/db/schema";
import { getSessionUser, json, unauthorized, badRequest } from "@/lib/api/http";
import { parseGoalInput, goalToApi } from "@/lib/api/validators";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return unauthorized();

  const rows = await db
    .select()
    .from(goal)
    .where(eq(goal.userId, user.id))
    .orderBy(desc(goal.createdAt));

  return json(rows.map(goalToApi));
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = parseGoalInput(body);
  if (!parsed.ok) return badRequest(parsed.error);

  const [row] = await db
    .insert(goal)
    .values({ id: randomUUID(), userId: user.id, ...parsed.data })
    .returning();

  return json(goalToApi(row), 201);
}
