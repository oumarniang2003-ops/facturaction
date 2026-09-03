"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, Zap } from "lucide-react";

const plans = [
  { id: "STARTER", name: "Starter", price: "19€/mois", features: ["Facturation & devis", "Clients illimités"] },
  { id: "PRO", name: "Pro", price: "39€/mois", features: ["Tout Starter", "Gestion de stock", "Alertes stock bas"], popular: true },
  { id: "BUSINESS", name: "Business", price: "79€/mois", features: ["Tout Pro", "Multi-utilisateurs", "Multi-boutiques"] },
];

export default function BillingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function subscribe(plan: string) {
    setLoadingPlan(plan);
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    setLoadingPlan(null);
    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
            <CreditCard className="size-5 text-brand" />
          </div>
          <span>Mon abonnement</span>
        </h1>
        <p className="text-sm text-neutral-500 mt-1.5 font-semibold">
          Chaque boutique choisit et paie son propre plan, indépendamment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <Card 
            key={p.id} 
            className={`bg-white border-neutral-200/60 shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between relative ${p.popular ? "ring-2 ring-brand border-transparent shadow-[0_8px_30px_rgb(193,51,23,0.12)]" : ""}`}
          >
            {p.popular && (
              <Badge className="absolute top-4 right-4 bg-brand text-white font-extrabold text-[10px] uppercase tracking-wider py-1 px-3 rounded-full">
                Populaire
              </Badge>
            )}
            <div>
              <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="font-display text-lg font-bold text-ink flex items-center gap-1.5">
                  {p.popular && <Zap className="size-4 text-brand fill-brand" />}
                  <span>{p.name}</span>
                </CardTitle>
                <div className="text-3xl font-display font-extrabold text-brand mt-3">{p.price}</div>
              </CardHeader>
              <CardContent className="px-6 pb-6 border-t border-neutral-100/60 pt-5">
                <ul className="space-y-3 text-xs text-neutral-600 font-semibold">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className="size-4 text-mint shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </div>
            <CardFooter className="px-6 pb-6 pt-0">
              <Button
                onClick={() => subscribe(p.id)}
                disabled={loadingPlan === p.id}
                variant={p.popular ? "default" : "outline"}
                className={`w-full h-11 font-bold rounded-full ${p.popular ? "bg-brand text-white shadow-md shadow-brand/20 hover:opacity-95" : "border-neutral-200 hover:bg-neutral-50 bg-white"}`}
              >
                {loadingPlan === p.id ? "Redirection..." : "Choisir ce plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
