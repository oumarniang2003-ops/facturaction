"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blurred blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-brand/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-72 h-72 bg-mint/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 bg-paper rounded-2xl flex items-center justify-center shadow-md shadow-brand/20 p-2.5">
            <img src="/logo-mark.png" alt="Factura" className="w-full h-full object-contain" />
          </div>
          <span className="font-display text-2xl font-extrabold text-ink tracking-tight">Factura</span>
        </div>

        <Card className="bg-white/80 backdrop-blur-md border-neutral-200/60 shadow-[0_8px_30px_rgb(193,51,23,0.08)] rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 pt-7 px-7 text-center">
            <CardTitle className="font-display text-xl font-bold text-ink">Connexion</CardTitle>
            <CardDescription className="text-xs text-neutral-500 mt-1.5 font-semibold">
              Connectez-vous pour accéder à votre espace de facturation.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-7 pb-7 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Adresse email</label>
                <Input
                  required
                  type="email"
                  placeholder="nom@exemple.com"
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Mot de passe</label>
                <Input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-xs text-amber font-bold">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-bold shadow-md shadow-brand/20 hover:opacity-95 transition-all duration-200 rounded-full bg-brand text-white flex items-center justify-center gap-2"
              >
                <LogIn className="size-4" />
                <span>{loading ? "Connexion en cours..." : "Se connecter"}</span>
              </Button>
            </form>

            <div className="text-center pt-3 border-t border-neutral-100/60">
              <p className="text-xs text-neutral-500 font-semibold">
                Pas encore de compte ?{" "}
                <Link href="/signup" className="text-brand hover:underline font-bold">
                  Créer un compte
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
