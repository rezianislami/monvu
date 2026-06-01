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
  // Linking stays enabled (for explicit, authenticated linkSocial later), but we
  // deliberately DON'T list google as a trusted provider. Our email/password
  // signup doesn't verify the email (requireEmailVerification: false), so
  // auto-linking a Google login into an unverified credential account would be
  // an account-takeover vector (attacker pre-registers a victim's email with a
  // password they control). With google untrusted + the credential account
  // unverified, a same-email Google sign-in fails with `account_not_linked`,
  // which the login/signup pages surface as a clear message. Safe linking is
  // done from an authenticated session instead (authClient.linkSocial).
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

export const isGoogleAuthEnabled = googleEnabled;

export type Session = typeof auth.$Infer.Session;
