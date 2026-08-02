"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, AlertTriangle, ShoppingCart } from "lucide-react";

type Product = {
  id: string; name: string; unitPrice: number; costPrice: number; vatRate: number;
  trackStock: boolean; stockQty: number; lowStock: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", costPrice: 0, vatRate: 0, trackStock: false, stockQty: 0 });
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
      body: JSON.stringify({ ...form, unitPrice: 0 }),
    });
    setForm({ name: "", costPrice: 0, vatRate: 0, trackStock: false, stockQty: 0 });
    setOpen(false);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
            <Package className="size-6 text-brand" /> Produits & stock
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gérez votre catalogue de produits et surveillez vos niveaux de stock en temps réel.
          </p>
        </div>
        <Button 
          onClick={() => setOpen(!open)} 
          variant="outline"
          className="h-10 px-4 font-semibold flex items-center gap-2 border-neutral-300 hover:bg-neutral-50 bg-white"
        >
          <Plus className="size-4" />
          <span>Nouveau produit</span>
        </Button>
      </div>

      <Link
        href="/dashboard/sales/new"
        className="block"
      >
        <Button 
          variant="default"
          className="w-full h-12 font-semibold text-base shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 rounded-xl"
        >
          <ShoppingCart className="size-5" />
          <span>Enregistrer une nouvelle vente</span>
        </Button>
      </Link>

      {open && (
        <Card className="p-5 border border-neutral-200 bg-white shadow-sm rounded-xl animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
              <Package className="size-4 text-brand" /> Ajouter un produit au catalogue
            </h2>
            <button 
              onClick={() => setOpen(false)} 
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors font-medium"
            >
              Fermer
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500">Nom du produit *</label>
              <Input 
                required 
                placeholder="Ex: Sac de ciment, Clavier sans fil" 
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500">Prix d'achat unitaire (F) *</label>
              <Input 
                type="number" 
                step="1" 
                required 
                placeholder="Ex: 5000" 
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                value={form.costPrice || ""} 
                onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })} 
              />
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Le prix de vente final sera spécifié pour chaque vente individuelle.
              </p>
            </div>
            
            <div className="col-span-2 flex items-center gap-2 py-1">
              <input 
                id="trackStock"
                type="checkbox" 
                className="rounded border-neutral-300 text-brand focus:ring-brand size-4 cursor-pointer"
                checked={form.trackStock}
                onChange={(e) => setForm({ ...form, trackStock: e.target.checked })} 
              />
              <label htmlFor="trackStock" className="text-sm font-medium text-neutral-700 cursor-pointer select-none">
                Activer le suivi des stocks pour ce produit
              </label>
            </div>

            {form.trackStock && (
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500">Quantité en stock initiale</label>
                <Input 
                  type="number" 
                  placeholder="Ex: 100" 
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                  value={form.stockQty} 
                  onChange={(e) => setForm({ ...form, stockQty: parseInt(e.target.value) || 0 })} 
                />
              </div>
            )}
            <Button 
              type="submit" 
              className="col-span-2 h-10 font-semibold shadow-sm hover:shadow transition-all duration-200 rounded-lg"
            >
              Enregistrer le produit
            </Button>
          </form>
        </Card>
      )}

      <Card className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-neutral-100">
          {products.map((p) => (
            <div key={p.id} className="px-5 py-4 flex justify-between items-center text-sm hover:bg-neutral-50/30 transition-colors">
              <div className="space-y-1">
                <span className="font-semibold text-ink text-sm">{p.name}</span>
                {p.trackStock && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {p.lowStock ? (
                      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-100 text-[10px] font-bold rounded-full py-0.5 px-2 flex items-center gap-1">
                        <AlertTriangle className="size-3 text-rose-600" />
                        <span>{p.stockQty} en stock · Stock bas</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-semibold rounded-full py-0.5 px-2">
                        {p.stockQty} en stock
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-neutral-500 font-medium bg-neutral-100 border border-neutral-200/50 rounded px-2.5 py-1">
                    Achat : {Number(p.costPrice).toLocaleString("fr-FR")} F
                  </span>
                </div>
                <Link
                  href={`/dashboard/sales/new?productId=${p.id}`}
                >
                  <Button variant="outline" className="shrink-0 h-8 text-xs font-semibold px-3 border-neutral-300 hover:bg-neutral-50 bg-white flex items-center gap-1 rounded-lg">
                    Vendre
                  </Button>
                </Link>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="size-8 text-neutral-300 mb-2" />
              <p className="text-neutral-500 text-sm">Aucun produit enregistré.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
