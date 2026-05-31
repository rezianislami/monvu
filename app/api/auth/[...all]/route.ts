import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Handles all Better Auth endpoints: sign-up, sign-in, sign-out, session, etc.
export const { POST, GET } = toNextJsHandler(auth);
