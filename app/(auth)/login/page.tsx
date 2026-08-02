"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { FileText, LogIn } from "lucide-react";

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
    <main className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-brand/10 text-brand rounded-xl border border-brand/20">
            <FileText className="size-8" />
          </div>
          <span className="font-display text-xl font-bold text-ink tracking-tight">FacturAction</span>
        </div>

        <Card className="bg-white border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 pt-6 px-6 text-center">
            <CardTitle className="font-display text-xl font-bold text-ink">Connexion</CardTitle>
            <CardDescription className="text-xs text-neutral-500 mt-1.5">
              Connectez-vous pour accéder à votre espace de facturation.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500">Adresse email</label>
                <Input
                  required
                  type="email"
                  placeholder="nom@exemple.com"
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500">Mot de passe</label>
                <Input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 font-semibold shadow-sm hover:shadow transition-all duration-200 rounded-lg flex items-center justify-center gap-2"
              >
                <LogIn className="size-4" />
                <span>{loading ? "Connexion en cours..." : "Se connecter"}</span>
              </Button>
            </form>

            <div className="text-center pt-2 border-t border-neutral-100">
              <p className="text-xs text-neutral-500 font-medium">
                Pas encore de compte ?{" "}
                <Link href="/signup" className="text-brand hover:underline font-semibold">
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
