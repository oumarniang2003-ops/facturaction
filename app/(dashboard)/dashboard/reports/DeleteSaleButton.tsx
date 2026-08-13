"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteSaleButtonProps {
  invoiceId: string;
  invoiceNumber: string;
}

export function DeleteSaleButton({ invoiceId, invoiceNumber }: DeleteSaleButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la suppression");
        setLoading(false);
        return;
      }
      // Refresh the page to recalculate CA & bénéfices
      router.refresh();
      setShowConfirm(false);
    } catch {
      setError("Erreur réseau");
      setLoading(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-neutral-200/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5 text-red-500" />
            </div>
            <div>
              <h2 className="font-bold text-ink text-base">Supprimer la vente ?</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Facture <span className="font-bold text-neutral-700">{invoiceNumber}</span></p>
            </div>
          </div>

          <p className="text-sm text-neutral-600 mb-5 leading-relaxed">
            Cette action est <span className="font-bold text-red-500">irréversible</span>. La facture sera définitivement supprimée et le chiffre d&apos;affaires et les bénéfices seront recalculés automatiquement.
          </p>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-semibold">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-10 font-semibold border-neutral-300 text-neutral-600 hover:bg-neutral-50 rounded-xl"
              onClick={() => { setShowConfirm(false); setError(null); }}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 h-10 font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-sm transition-colors"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Suppression…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Trash2 className="size-4" />
                  Supprimer
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="group flex items-center gap-1 text-[10px] font-bold text-neutral-400 hover:text-red-500 transition-colors"
      title="Supprimer cette vente"
    >
      <Trash2 className="size-3 group-hover:scale-110 transition-transform" />
      <span>Supprimer</span>
    </button>
  );
}
