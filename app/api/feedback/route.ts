import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { feedback } from "@/lib/db/schema";
import { getSessionUser, json, unauthorized, badRequest } from "@/lib/api/http";
import { parseFeedbackInput, feedbackToApi } from "@/lib/api/validators";

// Write-only from the FE: users submit, no read-back list (no admin UI yet).
export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = parseFeedbackInput(body);
  if (!parsed.ok) return badRequest(parsed.error);

  const [row] = await db
    .insert(feedback)
    .values({ id: randomUUID(), userId: user.id, ...parsed.data })
    .returning();

  return json(feedbackToApi(row), 201);
}
