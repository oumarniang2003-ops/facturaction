"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, AlertTriangle, ShoppingCart, Edit, Trash2, X } from "lucide-react";

type Product = {
  id: string; name: string; unitPrice: number; costPrice: number; vatRate: number;
  trackStock: boolean; stockQty: number; lowStock: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", costPrice: 0, vatRate: 0, trackStock: false, stockQty: 0 });
  const [open, setOpen] = useState(false);

  // Edit product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: "", costPrice: 0, vatRate: 0, trackStock: false, stockQty: 0 });
  const [savingEdit, setSavingEdit] = useState(false);

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

  function startEdit(p: Product) {
    setEditingProduct(p);
    setEditForm({
      name: p.name,
      costPrice: Number(p.costPrice),
      vatRate: Number(p.vatRate),
      trackStock: p.trackStock,
      stockQty: p.stockQty,
    });
  }

  async function handleUpdateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingEdit(true);

    await fetch(`/api/products/${editingProduct.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    setSavingEdit(false);
    setEditingProduct(null);
    load();
  }

  async function handleDelete(productId: string) {
    if (!confirm("Voulez-vous vraiment supprimer ce produit de votre catalogue ?")) return;

    await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
              <Package className="size-5 text-brand" />
            </div>
            <span>Produits & stock</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1.5 font-semibold">
            Gérez votre catalogue de produits, modifiez leurs informations et surveillez vos stocks.
          </p>
        </div>
        <Button 
          onClick={() => { setOpen(!open); setEditingProduct(null); }} 
          variant="outline"
          className="h-10 px-5 font-bold flex items-center gap-2 border-neutral-200 hover:bg-neutral-50 bg-white rounded-full"
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
          className="w-full h-12 font-bold text-base shadow-md shadow-brand/20 hover:opacity-95 transition-all duration-200 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-[#7C6FF0] text-white"
        >
          <ShoppingCart className="size-5" />
          <span>Enregistrer une nouvelle vente</span>
        </Button>
      </Link>

      {/* Form: Ajouter un produit */}
      {open && (
        <Card className="p-6 border border-neutral-200/60 bg-white shadow-[0_8px_30px_rgb(91,79,232,0.04)] rounded-3xl animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-neutral-100/60">
            <h2 className="text-sm font-bold text-ink flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center">
                <Package className="size-3.5 text-brand" />
              </div>
              Ajouter un produit au catalogue
            </h2>
            <button 
              onClick={() => setOpen(false)} 
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors font-bold"
            >
              Fermer
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Nom du produit *</label>
              <Input 
                required 
                placeholder="Ex: Sac de ciment, Clavier sans fil" 
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Prix d'achat unitaire (F) *</label>
              <Input 
                type="number" 
                step="1" 
                required 
                placeholder="Ex: 5000" 
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                value={form.costPrice || ""} 
                onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })} 
              />
              <p className="text-[11px] text-neutral-400 mt-0.5 font-semibold">
                Le prix de vente final sera spécifié pour chaque vente individuelle.
              </p>
            </div>
            
            <div className="col-span-2 flex items-center gap-2.5 py-1">
              <input 
                id="trackStock"
                type="checkbox" 
                className="rounded-full border-neutral-300 text-brand focus:ring-brand size-4 cursor-pointer"
                checked={form.trackStock}
                onChange={(e) => setForm({ ...form, trackStock: e.target.checked })} 
              />
              <label htmlFor="trackStock" className="text-sm font-semibold text-neutral-700 cursor-pointer select-none">
                Activer le suivi des stocks pour ce produit
              </label>
            </div>

            {form.trackStock && (
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Quantité en stock initiale</label>
                <Input 
                  type="number" 
                  placeholder="Ex: 100" 
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                  value={form.stockQty} 
                  onChange={(e) => setForm({ ...form, stockQty: parseInt(e.target.value) || 0 })} 
                />
              </div>
            )}
            <Button 
              type="submit" 
              className="col-span-2 h-11 font-bold shadow-md shadow-brand/20 hover:opacity-95 transition-all duration-200 rounded-full bg-gradient-to-r from-brand to-[#7C6FF0] text-white"
            >
              Enregistrer le produit
            </Button>
          </form>
        </Card>
      )}

      {/* Form: Modifier un produit */}
      {editingProduct && (
        <Card className="p-6 border border-brand/30 bg-white shadow-[0_8px_30px_rgb(91,79,232,0.08)] rounded-3xl animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-neutral-100/60">
            <h2 className="text-sm font-bold text-ink flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center">
                <Edit className="size-3.5 text-brand" />
              </div>
              Modifier les informations du produit : <span className="text-brand">{editingProduct.name}</span>
            </h2>
            <button 
              onClick={() => setEditingProduct(null)} 
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors font-bold flex items-center gap-1"
            >
              <X className="size-3.5" />
              <span>Annuler</span>
            </button>
          </div>
          <form onSubmit={handleUpdateSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Nom du produit *</label>
              <Input 
                required 
                placeholder="Ex: Sac de ciment, Clavier sans fil" 
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                value={editForm.name} 
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Prix d'achat unitaire (F) *</label>
              <Input 
                type="number" 
                step="1" 
                required 
                placeholder="Ex: 5000" 
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                value={editForm.costPrice || ""} 
                onChange={(e) => setEditForm({ ...editForm, costPrice: parseFloat(e.target.value) || 0 })} 
              />
            </div>
            
            <div className="col-span-2 flex items-center gap-2.5 py-1">
              <input 
                id="editTrackStock"
                type="checkbox" 
                className="rounded-full border-neutral-300 text-brand focus:ring-brand size-4 cursor-pointer"
                checked={editForm.trackStock}
                onChange={(e) => setEditForm({ ...editForm, trackStock: e.target.checked })} 
              />
              <label htmlFor="editTrackStock" className="text-sm font-semibold text-neutral-700 cursor-pointer select-none">
                Activer le suivi des stocks pour ce produit
              </label>
            </div>

            {editForm.trackStock && (
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Quantité en stock</label>
                <Input 
                  type="number" 
                  placeholder="Ex: 100" 
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                  value={editForm.stockQty} 
                  onChange={(e) => setEditForm({ ...editForm, stockQty: parseInt(e.target.value) || 0 })} 
                />
              </div>
            )}

            <div className="col-span-2 flex gap-3 pt-2">
              <Button 
                type="submit" 
                disabled={savingEdit}
                className="flex-1 h-11 font-bold shadow-md shadow-brand/20 hover:opacity-95 transition-all duration-200 rounded-full bg-gradient-to-r from-brand to-[#7C6FF0] text-white"
              >
                {savingEdit ? "Sauvegarde..." : "Mettre à jour le produit"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setEditingProduct(null)} 
                className="h-11 px-6 font-bold border-neutral-200 hover:bg-neutral-50 bg-white rounded-full"
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="bg-white rounded-3xl border border-neutral-200/60 overflow-hidden shadow-sm">
        <div className="divide-y divide-neutral-100/60">
          {products.map((p) => (
            <div key={p.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm hover:bg-neutral-50/30 transition-colors">
              <div className="space-y-1.5">
                <span className="font-bold text-ink text-sm">{p.name}</span>
                {p.trackStock && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {p.lowStock ? (
                      <Badge variant="outline" className="bg-amber/10 text-amber border-amber/20 text-[10px] font-extrabold rounded-full py-0.5 px-2.5 flex items-center gap-1">
                        <AlertTriangle className="size-3" />
                        <span>{p.stockQty} en stock · Stock bas</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-mint/10 text-mint border-mint/20 text-[10px] font-extrabold rounded-full py-0.5 px-2.5">
                        {p.stockQty} en stock
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-neutral-500 font-semibold bg-neutral-50 border border-neutral-200/60 rounded-full px-3 py-1.5">
                    Achat : {Number(p.costPrice).toLocaleString("fr-FR")} F
                  </span>
                </div>

                <Button 
                  onClick={() => startEdit(p)} 
                  variant="outline" 
                  className="shrink-0 h-8 text-xs font-bold px-3.5 border-neutral-200 hover:bg-neutral-50 bg-white flex items-center gap-1.5 rounded-full text-neutral-700"
                >
                  <Edit className="size-3.5 text-neutral-400" />
                  <span>Modifier</span>
                </Button>

                <Button 
                  onClick={() => handleDelete(p.id)} 
                  variant="outline" 
                  className="shrink-0 h-8 text-xs font-bold px-3 border-neutral-200 hover:bg-rose-50 hover:text-rose-600 bg-white flex items-center gap-1 rounded-full text-rose-500"
                  title="Supprimer le produit"
                >
                  <Trash2 className="size-3.5" />
                </Button>

                <Link
                  href={`/dashboard/sales/new?productId=${p.id}`}
                >
                  <Button variant="outline" className="shrink-0 h-8 text-xs font-bold px-4 border-neutral-200 hover:bg-neutral-50 bg-white flex items-center gap-1 rounded-full">
                    Vendre
                  </Button>
                </Link>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-3">
                <Package className="size-6 text-neutral-400" />
              </div>
              <p className="text-neutral-700 text-sm font-semibold">Aucun produit enregistré</p>
              <p className="text-neutral-400 text-xs mt-1">Ajoutez votre premier produit pour commencer.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
