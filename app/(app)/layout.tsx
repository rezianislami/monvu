import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { GUEST_COOKIE } from "@/lib/guest";
import { DataProvider } from "@/lib/data-store";
import { AppShell } from "@/components/layout/app-shell";

// Server-side auth guard for the whole app shell. Authenticated → real data.
// Guest cookie (no session) → render with read-only sample data. Neither → /login.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isGuest = !session && (await cookies()).get(GUEST_COOKIE)?.value === "1";
  if (!session && !isGuest) redirect("/login");

  return (
    <DataProvider isGuest={isGuest}>
      <AppShell>{children}</AppShell>
    </DataProvider>
  );
}
