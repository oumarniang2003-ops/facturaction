"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Check, FileText, ArrowRight, UserPlus, UserCheck, Users, Info } from "lucide-react";

type Product = {
  id: string; name: string; costPrice: number;
  trackStock: boolean; stockQty: number;
};
type Client = { id: string; name: string };

type SaleResult = {
  invoice: { id: string; number: string };
  revenue: number;
  profit: number;
  remainingStock: number | null;
};

export default function QuickSalePage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [productId, setProductId] = useState(searchParams.get("productId") ?? "");
  const [quantity, setQuantity] = useState(1);
  const [sellPrice, setSellPrice] = useState<number | "">("");
  const [clientMode, setClientMode] = useState<"counter" | "existing" | "new">("counter");
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SaleResult | null>(null);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
    fetch("/api/clients").then((r) => r.json()).then(setClients);
  }, []);

  const selectedProduct = products.find((p) => p.id === productId);
  const effectivePrice = sellPrice === "" ? 0 : Number(sellPrice);
  const effectiveCost = Number(selectedProduct?.costPrice ?? 0);
  const estimatedProfit = (effectivePrice - effectiveCost) * quantity;

  function resetForm() {
    setProductId("");
    setQuantity(1);
    setSellPrice("");
    setClientMode("counter");
    setClientId("");
    setClientName("");
    setClientPhone("");
    setResult(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (sellPrice === "" || Number(sellPrice) <= 0) {
      setError("Indiquez le prix de vente pour cette vente.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/sales/quick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        quantity,
        sellPrice: Number(sellPrice),
        clientId: clientMode === "existing" ? clientId : clientMode === "new" ? "new" : undefined,
        clientName: clientMode === "new" ? clientName : undefined,
        clientPhone: clientMode === "new" ? clientPhone : undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    setResult(data);
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }

  if (result) {
    return (
      <div className="max-w-lg space-y-6">
        <Card className="bg-white border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand to-mint text-white flex items-center justify-center mx-auto shadow-md">
              <Check className="size-8 stroke-[3]" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">Vente enregistrée !</h1>
              <p className="text-neutral-500 text-sm mt-1 font-semibold">Facture {result.invoice.number}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50/50 border border-neutral-200/50 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Montant Vendu</p>
                <p className="text-lg font-display font-extrabold text-ink">{result.revenue.toLocaleString("fr-FR")} F</p>
              </div>
              <div className="bg-mint/5 border border-mint/10 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-bold text-mint uppercase tracking-wider mb-1">Bénéfice réalisé</p>
                <p className="text-lg font-display font-extrabold text-mint">{result.profit.toLocaleString("fr-FR")} F</p>
              </div>
            </div>

            {result.remainingStock !== null && (
              <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-2xl text-xs text-neutral-500 inline-block font-semibold">
                Stock restant pour ce produit : {result.remainingStock} unités.
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={`/api/invoices/${result.invoice.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <Button className="w-full h-11 font-bold flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-[#7C6FF0] text-white shadow-md shadow-brand/20">
                  <FileText className="size-4" />
                  <span>Voir la facture (PDF)</span>
                </Button>
              </a>
              <Button
                onClick={resetForm}
                variant="outline"
                className="w-full h-11 font-bold border-neutral-200 hover:bg-neutral-50 bg-white rounded-full"
              >
                Enregistrer une autre vente
              </Button>
              <Link href="/dashboard/invoices" className="text-xs text-neutral-400 hover:text-brand hover:underline font-bold block pt-2">
                Retour à la liste des factures
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
            <ShoppingCart className="size-5 text-brand" />
          </div>
          <span>Vente rapide</span>
        </h1>
        <p className="text-sm text-neutral-500 mt-1.5">
          Enregistrez une vente directe au comptoir. La facture et le bénéfice net sont calculés automatiquement.
        </p>
      </div>

      <Card className="bg-white border-neutral-200/60 shadow-[0_8px_30px_rgb(91,79,232,0.04)] rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Produit vendu</label>
              <select
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded-full border border-neutral-200 bg-white px-4 h-10 text-sm font-semibold outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 transition-all text-neutral-700 cursor-pointer"
              >
                <option value="">Choisir un produit dans le catalogue</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.trackStock ? `(${p.stockQty} en stock)` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Quantité</label>
                <Input
                  type="number"
                  min={1}
                  required
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full font-semibold px-4"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Prix de vente (F)</label>
                <Input
                  type="number"
                  min={0}
                  required
                  placeholder="Ex: 2500"
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full font-semibold px-4"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
                />
              </div>
            </div>

            {selectedProduct && sellPrice !== "" && (
              <div className="bg-mint/5 border border-mint/10 rounded-2xl px-4 py-3.5 flex justify-between items-center text-xs font-bold">
                <span className="text-neutral-500">Bénéfice estimé :</span>
                <span className="text-mint text-sm font-display font-extrabold">{estimatedProfit.toLocaleString("fr-FR")} F</span>
              </div>
            )}

            <div className="space-y-3 pt-4 border-t border-neutral-100/60">
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Client</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={clientMode === "counter" ? "default" : "outline"}
                  onClick={() => setClientMode("counter")}
                  className={`h-10 text-xs font-bold border-neutral-200 rounded-full flex items-center justify-center gap-1 ${clientMode === "counter" ? "bg-brand text-white" : ""}`}
                >
                  <Users className="size-3.5 shrink-0" />
                  <span>Comptoir</span>
                </Button>
                <Button
                  type="button"
                  variant={clientMode === "existing" ? "default" : "outline"}
                  onClick={() => setClientMode("existing")}
                  className={`h-10 text-xs font-bold border-neutral-200 rounded-full flex items-center justify-center gap-1 ${clientMode === "existing" ? "bg-brand text-white" : ""}`}
                >
                  <UserCheck className="size-3.5 shrink-0" />
                  <span>Existant</span>
                </Button>
                <Button
                  type="button"
                  variant={clientMode === "new" ? "default" : "outline"}
                  onClick={() => setClientMode("new")}
                  className={`h-10 text-xs font-bold border-neutral-200 rounded-full flex items-center justify-center gap-1 ${clientMode === "new" ? "bg-brand text-white" : ""}`}
                >
                  <UserPlus className="size-3.5 shrink-0" />
                  <span>Nouveau</span>
                </Button>
              </div>

              {clientMode === "existing" && (
                <div className="pt-1.5">
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full rounded-full border border-neutral-200 bg-white px-4 h-10 text-sm font-semibold outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 transition-all text-neutral-700 cursor-pointer"
                  >
                    <option value="">Choisir un client existant</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {clientMode === "new" && (
                <div className="grid grid-cols-2 gap-3 pt-1.5">
                  <Input
                    required
                    placeholder="Nom du client *"
                    className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full font-semibold px-4"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                  <Input
                    placeholder="Téléphone"
                    className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full font-semibold px-4"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                </div>
              )}
            </div>

            {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

            <Button
              type="submit"
              disabled={loading || !productId}
              className="w-full h-11 font-bold shadow-md shadow-brand/20 hover:opacity-95 transition-all duration-200 rounded-full bg-gradient-to-r from-brand to-[#7C6FF0] text-white"
            >
              {loading ? "Enregistrement..." : "Confirmer la vente"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
