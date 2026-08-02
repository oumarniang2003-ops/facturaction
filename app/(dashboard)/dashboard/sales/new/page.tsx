"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Check, FileText, ArrowRight, UserPlus, UserCheck, Users } from "lucide-react";

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
  const [clientMode, setClientMode] = useState<"existing" | "new" | "counter">("counter");
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
        <Card className="bg-white border-neutral-200 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6 text-center space-y-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto text-xl">
              <Check className="size-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">Vente enregistrée !</h1>
              <p className="text-neutral-500 text-sm mt-1">Facture {result.invoice.number}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50/50 border border-neutral-200/50 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Montant Vendu</p>
                <p className="text-lg font-bold text-ink">{result.revenue.toLocaleString("fr-FR")} F</p>
              </div>
              <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Bénéfice réalisé</p>
                <p className="text-lg font-bold text-emerald-700">{result.profit.toLocaleString("fr-FR")} F</p>
              </div>
            </div>

            {result.remainingStock !== null && (
              <div className="p-2.5 bg-neutral-50 rounded-lg text-xs text-neutral-500 inline-block font-medium">
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
                <Button className="w-full h-10 font-semibold flex items-center justify-center gap-1.5 rounded-lg shadow-sm">
                  <FileText className="size-4" />
                  <span>Voir la facture (PDF)</span>
                </Button>
              </a>
              <Button
                onClick={resetForm}
                variant="outline"
                className="w-full h-10 font-semibold border-neutral-300 hover:bg-neutral-50 bg-white rounded-lg"
              >
                Enregistrer une autre vente
              </Button>
              <Link href="/dashboard/invoices" className="text-xs text-neutral-500 hover:text-brand hover:underline font-semibold block pt-2">
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
        <h1 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
          <ShoppingCart className="size-6 text-brand" /> Vente rapide
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Enregistrez une vente directe au comptoir. La facture et le bénéfice net sont calculés automatiquement.
        </p>
      </div>

      <Card className="bg-white border-neutral-200 shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Produit vendu</label>
              <select
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 h-10 text-sm font-medium outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 transition-all text-neutral-700 cursor-pointer"
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
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Quantité</label>
                <Input
                  type="number"
                  min={1}
                  required
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Prix de vente (F)</label>
                <Input
                  type="number"
                  min={0}
                  required
                  placeholder="Ex: 2500"
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
                />
              </div>
            </div>

            {selectedProduct && sellPrice !== "" && (
              <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl px-4 py-3 flex justify-between items-center text-xs font-semibold">
                <span className="text-emerald-800">Bénéfice estimé :</span>
                <span className="text-emerald-700 text-sm">{estimatedProfit.toLocaleString("fr-FR")} F</span>
              </div>
            )}

            <div className="space-y-2.5 pt-2 border-t border-neutral-100">
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">Client</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={clientMode === "counter" ? "default" : "outline"}
                  onClick={() => setClientMode("counter")}
                  className="h-9 text-xs font-semibold border-neutral-300 rounded-lg flex items-center justify-center gap-1"
                >
                  <Users className="size-3.5 shrink-0" />
                  <span>Comptoir</span>
                </Button>
                <Button
                  type="button"
                  variant={clientMode === "existing" ? "default" : "outline"}
                  onClick={() => setClientMode("existing")}
                  className="h-9 text-xs font-semibold border-neutral-300 rounded-lg flex items-center justify-center gap-1"
                >
                  <UserCheck className="size-3.5 shrink-0" />
                  <span>Existant</span>
                </Button>
                <Button
                  type="button"
                  variant={clientMode === "new" ? "default" : "outline"}
                  onClick={() => setClientMode("new")}
                  className="h-9 text-xs font-semibold border-neutral-300 rounded-lg flex items-center justify-center gap-1"
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
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 h-10 text-sm font-medium outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 transition-all text-neutral-700 cursor-pointer"
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
                    className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                  <Input
                    placeholder="Téléphone (optionnel)"
                    className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
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
              className="w-full h-11 font-semibold shadow-sm hover:shadow transition-all duration-200 rounded-xl"
            >
              {loading ? "Enregistrement..." : "Confirmer la vente"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
