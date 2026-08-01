"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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
      <div className="max-w-lg">
        <div className="bg-white rounded-xl border border-neutral-200 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto mb-4 text-2xl">
            ✓
          </div>
          <h1 className="font-display text-2xl text-ink mb-1">Vente enregistrée !</h1>
          <p className="text-neutral-500 text-sm mb-6">Facture {result.invoice.number}</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-500 mb-1">Vendu</p>
              <p className="text-xl font-semibold text-ink">{result.revenue.toLocaleString("fr-FR")} F</p>
            </div>
            <div className="bg-brand/5 rounded-lg p-4">
              <p className="text-xs text-neutral-500 mb-1">Bénéfice réalisé</p>
              <p className="text-xl font-semibold text-brand">{result.profit.toLocaleString("fr-FR")} F</p>
            </div>
          </div>

          {result.remainingStock !== null && (
            <p className="text-sm text-neutral-500 mb-6">
              Il reste {result.remainingStock} en stock pour ce produit.
            </p>
          )}

          <div className="flex flex-col gap-2">
            <a
              href={`/api/invoices/${result.invoice.id}/pdf`}
              target="_blank"
              className="rounded-lg bg-ink hover:bg-black text-white text-sm font-medium py-2.5 transition-colors"
            >
              Voir la facture (PDF)
            </a>
            <button
              onClick={resetForm}
              className="rounded-lg border border-neutral-300 text-ink text-sm font-medium py-2.5 hover:bg-neutral-50 transition-colors"
            >
              Enregistrer une autre vente
            </button>
            <Link
              href="/dashboard/invoices"
              className="text-sm text-neutral-500 hover:text-brand mt-1"
            >
              Retour aux factures
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl text-ink mb-2">Vente rapide</h1>
      <p className="text-neutral-600 mb-6">
        Enregistrez une vente en boutique en 1 minute : la facture et le
        bénéfice sont calculés automatiquement.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Produit vendu</label>
          <select
            required
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">Choisir un produit</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.trackStock ? ` (${p.stockQty} en stock)` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Quantité</label>
            <input
              type="number"
              min={1}
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Prix de vente (F)</label>
            <input
              type="number"
              min={0}
              required
              placeholder="Ex: 2500"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
            />
          </div>
        </div>

        {selectedProduct && sellPrice !== "" && (
          <div className="bg-brand/5 rounded-lg px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-neutral-600">Bénéfice estimé</span>
            <span className="font-semibold text-brand">{estimatedProfit.toLocaleString("fr-FR")} F</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Client</label>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setClientMode("counter")}
              className={`flex-1 rounded-lg border text-sm py-2 ${clientMode === "counter" ? "border-brand bg-brand/5 text-brand font-medium" : "border-neutral-300 text-neutral-600"}`}
            >
              Vente comptoir
            </button>
            <button
              type="button"
              onClick={() => setClientMode("existing")}
              className={`flex-1 rounded-lg border text-sm py-2 ${clientMode === "existing" ? "border-brand bg-brand/5 text-brand font-medium" : "border-neutral-300 text-neutral-600"}`}
            >
              Client existant
            </button>
            <button
              type="button"
              onClick={() => setClientMode("new")}
              className={`flex-1 rounded-lg border text-sm py-2 ${clientMode === "new" ? "border-brand bg-brand/5 text-brand font-medium" : "border-neutral-300 text-neutral-600"}`}
            >
              Nouveau client
            </button>
          </div>

          {clientMode === "existing" && (
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">Choisir un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {clientMode === "new" && (
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                placeholder="Nom du client"
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
              <input
                placeholder="Téléphone (optionnel)"
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !productId}
          className="w-full rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold py-3 transition-colors disabled:opacity-60"
        >
          {loading ? "Enregistrement..." : "✓ J'ai vendu ce produit"}
        </button>
      </form>
    </div>
  );
}
