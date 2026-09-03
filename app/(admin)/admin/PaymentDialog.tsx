"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

type PaymentMethod = "CARD" | "CASH" | "TRANSFER" | "CHECK" | "WAVE" | "ORANGE_MONEY";

type Payment = {
  id: string;
  amount: string;
  method: PaymentMethod;
  note: string | null;
  paidAt: string;
};

const methodLabels: Record<PaymentMethod, string> = {
  CARD: "Carte",
  CASH: "Espèces",
  TRANSFER: "Virement",
  CHECK: "Chèque",
  WAVE: "Wave",
  ORANGE_MONEY: "Orange Money",
};

function todayPlusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function PaymentDialog({
  merchantId,
  businessName,
  onSaved,
}: {
  merchantId: string;
  businessName: string;
  onSaved: (data: { paidUntil: string | null; status: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Payment[]>([]);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("WAVE");
  const [paidUntil, setPaidUntil] = useState(todayPlusDays(30));
  const [note, setNote] = useState("");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    setError(null);
    if (next) {
      setLoading(true);
      fetch(`/api/admin/merchants/${merchantId}/payments`)
        .then((r) => r.json())
        .then((data) => setHistory(data.payments ?? []))
        .finally(() => setLoading(false));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/admin/merchants/${merchantId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        method,
        paidUntil,
        note: note.trim() || undefined,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Échec de l'enregistrement. Vérifiez les champs.");
      return;
    }

    onSaved({ paidUntil, status: "ACTIVE" });
    setAmount("");
    setNote("");
    setPaidUntil(todayPlusDays(30));
    handleOpenChange(true); // refresh history
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="h-8 px-3 text-xs font-bold rounded-full border-neutral-200 hover:bg-neutral-50 flex items-center gap-1.5"
          />
        }
      >
        <CreditCard className="size-3.5 text-neutral-500" />
        Paiement
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Paiement manuel — {businessName}</DialogTitle>
          <DialogDescription>
            Enregistrez un paiement d&apos;abonnement reçu par Wave, Orange Money ou tout
            autre moyen, et fixez jusqu&apos;à quand l&apos;accès reste valide.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Montant (FCFA)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 h-10 text-sm font-semibold outline-none focus:border-brand focus:ring-3 focus:ring-brand/20"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Méthode
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 h-10 text-sm font-semibold outline-none focus:border-brand cursor-pointer bg-white"
              >
                {Object.entries(methodLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Accès valide jusqu&apos;au
            </label>
            <input
              type="date"
              required
              value={paidUntil}
              onChange={(e) => setPaidUntil(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 h-10 text-sm font-semibold outline-none focus:border-brand focus:ring-3 focus:ring-brand/20"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Note (optionnel)
            </label>
            <input
              type="text"
              placeholder="Ex: reçu envoyé par WhatsApp"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 h-10 text-sm font-semibold outline-none focus:border-brand focus:ring-3 focus:ring-brand/20"
            />
          </div>

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={saving} className="font-bold">
              {saving ? "Enregistrement..." : "Enregistrer le paiement"}
            </Button>
          </DialogFooter>
        </form>

        <div className="border-t border-neutral-100 pt-3">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
            Historique
          </p>
          {loading ? (
            <p className="text-xs text-neutral-400 font-semibold">Chargement...</p>
          ) : history.length === 0 ? (
            <p className="text-xs text-neutral-400 font-semibold">Aucun paiement enregistré.</p>
          ) : (
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {history.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center text-xs bg-neutral-50 rounded-lg px-3 py-2"
                >
                  <div>
                    <span className="font-bold text-ink">{Number(p.amount).toLocaleString("fr-FR")} F</span>
                    <span className="text-neutral-400"> · {methodLabels[p.method]}</span>
                    {p.note && <p className="text-neutral-400 mt-0.5">{p.note}</p>}
                  </div>
                  <span className="text-neutral-400 font-semibold shrink-0 ml-2">
                    {new Date(p.paidAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
