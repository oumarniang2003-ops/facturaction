"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RecordPaymentButtonProps = {
  invoiceId: string;
  invoiceNumber: string;
  total: number;
  advanceReceived: number;
};

const PAYMENT_METHODS = [
  { label: "Espèces", value: "CASH" },
  { label: "Wave", value: "WAVE" },
  { label: "Orange Money", value: "ORANGE_MONEY" },
  { label: "Virement Bancaire", value: "TRANSFER" },
  { label: "Chèque", value: "CHECK" },
  { label: "Carte Bancaire", value: "CARD" },
];

export function RecordPaymentButton({
  invoiceId,
  invoiceNumber,
  total,
  advanceReceived,
}: RecordPaymentButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [method, setMethod] = useState("CASH");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const remaining = Math.max(0, total - advanceReceived);

  // When opening modal, pre-fill amount with the exact remaining balance
  function handleOpen() {
    setAmount(remaining);
    setMethod("CASH");
    setError("");
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Le montant doit être supérieur à 0.");
      return;
    }
    if (Number(amount) > remaining) {
      setError(`Le montant ne peut pas dépasser le solde restant (${remaining} F).`);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          method,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Hide the button if the invoice is already fully paid
  if (remaining <= 0) return null;

  return (
    <>
      <button
        onClick={handleOpen}
        className="px-2 py-1 text-xs font-semibold rounded bg-brand/10 hover:bg-brand/20 text-brand transition-colors"
      >
        💰 Régler
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-neutral-200 w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200 text-left">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 text-lg font-bold"
            >
              &times;
            </button>

            <h3 className="font-display text-xl text-ink mb-2">Enregistrer un règlement</h3>
            <p className="text-sm text-neutral-500 mb-6">
              Facture <strong>{invoiceNumber}</strong> · Solde restant : <strong>{remaining.toLocaleString("fr-FR")} F</strong>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Montant à régler (F CFA)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={remaining}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || "")}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Mode de règlement
                </label>
                <select
                  required
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-neutral-300 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors text-center"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-brand hover:bg-brand-dark text-white py-2 text-sm font-semibold transition-colors disabled:opacity-60 text-center"
                >
                  {saving ? "Enregistrement..." : "Confirmer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
