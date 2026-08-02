"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { FileText, UserPlus, Store } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Une erreur est survenue.");
      return;
    }

    router.push("/login?signup=success");
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blurred blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 bg-brand/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-72 h-72 bg-gold/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 bg-gradient-to-tr from-brand to-[#7C6FF0] text-white rounded-2xl flex items-center justify-center shadow-md shadow-brand/20">
            <FileText className="size-7" />
          </div>
          <span className="font-display text-2xl font-extrabold text-ink tracking-tight">FacturAction</span>
        </div>

        <Card className="bg-white/80 backdrop-blur-md border-neutral-200/60 shadow-[0_8px_30px_rgb(91,79,232,0.08)] rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 pt-7 px-7 text-center">
            <CardTitle className="font-display text-xl font-bold text-ink">Créer un compte</CardTitle>
            <CardDescription className="text-xs text-neutral-500 mt-1.5 flex items-center gap-1.5 justify-center font-semibold">
              <Store className="size-3.5 text-neutral-400" />
              <span>Chaque commerçant a son propre espace sécurisé.</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-7 pb-7 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Nom de la boutique</label>
                <Input
                  required
                  placeholder="Ex: Ma Super Boutique"
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Votre nom complet</label>
                <Input
                  required
                  placeholder="Ex: Jean Dupont"
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Adresse email</label>
                <Input
                  required
                  type="email"
                  placeholder="nom@exemple.com"
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Mot de passe</label>
                <Input
                  required
                  type="password"
                  minLength={8}
                  placeholder="•••••••• (8 caractères min.)"
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              {error && <p className="text-xs text-amber font-bold">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-bold shadow-md shadow-brand/20 hover:opacity-95 transition-all duration-200 rounded-full bg-gradient-to-r from-brand to-[#7C6FF0] text-white flex items-center justify-center gap-2"
              >
                <UserPlus className="size-4" />
                <span>{loading ? "Création du compte..." : "Créer mon compte"}</span>
              </Button>
            </form>

            <div className="text-center pt-3 border-t border-neutral-100/60">
              <p className="text-xs text-neutral-500 font-semibold">
                Déjà inscrit ?{" "}
                <Link href="/login" className="text-brand hover:underline font-bold">
                  Se connecter
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
