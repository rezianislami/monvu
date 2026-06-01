"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { enterGuest, exitGuest } from "@/lib/guest";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/common/password-input";
import { GoogleIcon } from "@/components/common/google-icon";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Email atau password salah");
      return;
    }
    // Drop any guest flag so the real session takes over.
    exitGuest();
    router.push("/");
    router.refresh();
  };

  const handleGuest = () => {
    enterGuest();
    router.push("/");
    router.refresh();
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    // Leaving for Google's consent screen — drop any guest flag first. On
    // success the browser is redirected to callbackURL, so no router.push here.
    exitGuest();
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
    if (error) {
      setLoading(false);
      setError(error.message ?? "Gagal masuk dengan Google");
    }
  };

  return (
    <Card className="glass-card border-border/50 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Masuk</CardTitle>
        <CardDescription>Masuk ke dashboard kekayaan Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kamu@email.com"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Memproses…" : "Masuk"}
          </Button>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">atau</span>
            <Separator className="flex-1" />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full"
          >
            <GoogleIcon className="h-4 w-4" />
            Lanjut dengan Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleGuest}
            disabled={loading}
            className="w-full"
          >
            Masuk sebagai Tamu
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Belum punya akun?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Daftar
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
