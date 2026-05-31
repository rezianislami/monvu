import { auth } from "@/lib/auth";

// Returns the authenticated user, or null. Use in route handlers to guard.
export async function getSessionUser(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export const unauthorized = () => json({ error: "Unauthorized" }, 401);
export const badRequest = (message: string) => json({ error: message }, 400);
export const notFound = () => json({ error: "Not found" }, 404);
