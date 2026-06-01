import { createAuthClient } from "better-auth/react";

// Same-origin: baseURL is inferred. Exposes signIn / signUp / signOut / useSession
// for the FE integration step.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;

// Maps Better Auth error codes — from the OAuth callback `?error=` param or a
// returned error — to user-facing Indonesian copy. OAuth-callback failures come
// back as a redirect query param (not the promise result), so pages read this
// off the URL on load.
export function authErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  switch (code) {
    case "account_not_linked":
      return "Email ini sudah terdaftar dengan password. Masuk pakai password dulu.";
    default:
      return "Gagal masuk dengan Google. Coba lagi.";
  }
}
