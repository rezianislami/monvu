import { defineConfig } from "drizzle-kit";

// drizzle-kit auto-loads .env / .env.local. If your shell doesn't pick it up,
// prefix commands with the var, e.g. `DATABASE_URL=... npm run db:migrate`.
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
