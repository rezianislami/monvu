import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";

// Only register Google when both creds are present. Passing an undefined
// clientId/secret makes Better Auth throw at init — guarding here keeps the app
// (and the existing email/password flow) booting before OAuth is configured.
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleEnabled = Boolean(googleClientId && googleClientSecret);

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    // No email-sending wired yet — keep verification off so signup works locally.
    requireEmailVerification: false,
  },
  socialProviders: googleEnabled
    ? {
        google: {
          clientId: googleClientId as string,
          clientSecret: googleClientSecret as string,
        },
      }
    : undefined,
  // Link a Google sign-in to an existing email/password account with the same
  // (verified) email instead of erroring on the duplicate. Google emails are
  // verified, so "google" is safe to trust here.
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

export const isGoogleAuthEnabled = googleEnabled;

export type Session = typeof auth.$Infer.Session;
