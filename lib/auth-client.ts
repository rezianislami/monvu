import { createAuthClient } from "better-auth/react";

// Same-origin: baseURL is inferred. Exposes signIn / signUp / signOut / useSession
// for the FE integration step.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
