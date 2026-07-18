"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string; name: string; unitPrice: number; vatRate: number;
  trackStock: boolean; stockQty: number; lowStock: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", unitPrice: 0, vatRate: 20, trackStock: false, stockQty: 0 });
  const [open, setOpen] = useState(false);

  function load() {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }
  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", unitPrice: 0, vatRate: 20, trackStock: false, stockQty: 0 });
    setOpen(false);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Produits & stock</h1>
        <button onClick={() => setOpen(!open)} className="rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2">
          + Nouveau produit
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-200 p-4 mb-6 grid grid-cols-2 gap-3">
          <input required placeholder="Nom du produit" className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="number" step="0.01" placeholder="Prix unitaire HT" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })} />
          <input type="number" step="0.1" placeholder="TVA %" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={form.vatRate} onChange={(e) => setForm({ ...form, vatRate: parseFloat(e.target.value) || 0 })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.trackStock}
              onChange={(e) => setForm({ ...form, trackStock: e.target.checked })} />
            Suivre le stock
          </label>
          {form.trackStock && (
            <input type="number" placeholder="Quantité initiale" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: parseInt(e.target.value) || 0 })} />
          )}
          <button type="submit" className="col-span-2 rounded-lg bg-ink text-white text-sm font-medium py-2">
            Enregistrer
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
        {products.map((p) => (
          <div key={p.id} className="px-4 py-3 flex justify-between items-center text-sm">
            <div>
              <span className="font-medium text-ink">{p.name}</span>
              {p.trackStock && (
                <span className={`ml-2 text-xs ${p.lowStock ? "text-amber font-medium" : "text-neutral-500"}`}>
                  {p.stockQty} en stock {p.lowStock && "· stock bas"}
                </span>
              )}
            </div>
            <span className="text-neutral-700">{p.unitPrice} € HT</span>
          </div>
        ))}
        {products.length === 0 && (
          <p className="px-4 py-6 text-center text-neutral-500 text-sm">Aucun produit enregistré.</p>
        )}
      </div>
    </div>
  );
}
