import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Already signed in → skip the auth screens.
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-2 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--nb-border)] bg-[var(--nb-pink)] font-display text-lg font-extrabold text-white [box-shadow:3px_3px_0px_var(--nb-shadow)]">
            M
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight">
            Mon<span className="text-[var(--nb-pink)]">vu</span>
          </span>
        </div>
        <p className="mb-6 text-center font-mono text-xs font-bold uppercase tracking-wide text-[var(--nb-text-muted)]">
          Semua asetmu, satu pandangan
        </p>
        {children}
      </div>
    </div>
  );
}
