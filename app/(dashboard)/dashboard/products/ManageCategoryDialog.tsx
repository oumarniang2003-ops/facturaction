"use client";

import { useState } from "react";
import { X, Check, Search, Loader2 } from "lucide-react";

type Product = {
  id: string;
  name: string;
  category: string | null;
  costPrice: number;
  vatRate: number;
  trackStock: boolean;
  stockQty: number;
};

export function ManageCategoryDialog({
  category,
  products,
  onClose,
  onToggled,
}: {
  category: string;
  products: Product[];
  onClose: () => void;
  onToggled: (productId: string, newCategory: string | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const memberCount = products.filter((p) => p.category === category).length;

  async function toggle(p: Product) {
    const nextCategory = p.category === category ? null : category;
    setPendingId(p.id);
    await fetch(`/api/products/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: p.name,
        costPrice: p.costPrice,
        trackStock: p.trackStock,
        stockQty: p.stockQty,
        vatRate: p.vatRate,
        category: nextCategory,
      }),
    });
    setPendingId(null);
    onToggled(p.id, nextCategory);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-neutral-200/60 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div>
            <h2 className="font-bold text-ink text-base">Catégorie : {category}</h2>
            <p className="text-xs text-neutral-400 font-semibold mt-0.5">
              {memberCount} produit{memberCount > 1 ? "s" : ""} · coche/décoche pour ajuster
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full pl-9 pr-4 h-9 rounded-full border border-neutral-200 bg-white text-sm font-semibold outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pt-3 space-y-1.5">
          {filtered.length === 0 ? (
            <p className="text-xs text-neutral-400 font-semibold text-center py-8">Aucun produit trouvé.</p>
          ) : (
            filtered.map((p) => {
              const isMember = p.category === category;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p)}
                  disabled={pendingId === p.id}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors ${
                    isMember ? "bg-brand/5 hover:bg-brand/10" : "hover:bg-neutral-50"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isMember ? "bg-brand border-brand" : "border-neutral-300"
                    }`}
                  >
                    {pendingId === p.id ? (
                      <Loader2 className="size-3 text-white animate-spin" />
                    ) : isMember ? (
                      <Check className="size-3.5 text-white" strokeWidth={3} />
                    ) : null}
                  </span>
                  <span className="text-sm font-semibold text-neutral-700 flex-1 truncate">{p.name}</span>
                  {p.category && p.category !== category && (
                    <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full shrink-0">
                      {p.category}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
