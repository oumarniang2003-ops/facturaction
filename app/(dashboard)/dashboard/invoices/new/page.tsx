"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Line = { description: string; quantity: number; unitPrice: number; vatRate: number };
type Client = { id: string; name: string };

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [type, setType] = useState<"QUOTE" | "INVOICE">("INVOICE");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<Line[]>([
    { description: "", quantity: 1, unitPrice: 0, vatRate: 20 },
  ]);
  const [advanceReceived, setAdvanceReceived] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then(setClients);
  }, []);

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0, vatRate: 20 }]);
  }

  const total = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice * (1 + l.vatRate / 100), 0);
  const advance = advanceReceived === "" ? 0 : Number(advanceReceived);
  const remainingBalance = Math.max(0, total - advance);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        type,
        issueDate,
        lines,
        advanceReceived: advance,
        paymentMethod: type === "INVOICE" ? paymentMethod : null,
      }),
    });
    setSaving(false);
    if (res.ok) router.push("/dashboard/invoices");
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-ink mb-6">Nouvelle facture</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Client
            </label>
            <select
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">Choisir un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Type de document
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "QUOTE" | "INVOICE")}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="INVOICE">Facture</option>
              <option value="QUOTE">Devis</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Date de la facture
            </label>
            <input
              type="date"
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
          {/* Table headers */}
          <div className="grid grid-cols-12 gap-2 text-xs font-bold text-neutral-400 mb-1 px-1">
            <div className="col-span-5">Désignation</div>
            <div className="col-span-2 text-center">Quantité</div>
            <div className="col-span-3 text-right">P. Unitaire (F)</div>
            <div className="col-span-2 text-right">TVA (%)</div>
          </div>

          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input
                placeholder="Désignation (ex: Réfrigérateur, Climatiseur...)"
                required
                className="col-span-5 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                value={line.description}
                onChange={(e) => updateLine(i, { description: e.target.value })}
              />
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Qté"
                className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-center"
                value={line.quantity}
                onChange={(e) => updateLine(i, { quantity: parseFloat(e.target.value) || 0 })}
              />
              <input
                type="number"
                min={0}
                step="1"
                placeholder="P. Unitaire"
                className="col-span-3 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-right"
                value={line.unitPrice}
                onChange={(e) => updateLine(i, { unitPrice: parseFloat(e.target.value) || 0 })}
              />
              <input
                type="number"
                min={0}
                step="0.1"
                placeholder="TVA %"
                className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-right"
                value={line.vatRate}
                onChange={(e) => updateLine(i, { vatRate: parseFloat(e.target.value) || 0 })}
              />
            </div>
          ))}
          <button type="button" onClick={addLine} className="text-sm text-brand font-medium">
            + Ajouter une ligne
          </button>
        </div>

        {type === "INVOICE" && (
          <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                Acompte / Avance reçue (F CFA)
              </label>
              <input
                type="number"
                min={0}
                step="1"
                placeholder="Ex: 5000"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                value={advanceReceived}
                onChange={(e) => setAdvanceReceived(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                Mode de paiement
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="CASH">Espèces</option>
                <option value="CHECK">Chèque</option>
                <option value="WAVE">Wave</option>
                <option value="ORANGE_MONEY">Orange Money</option>
                <option value="CARD">Carte Bancaire</option>
                <option value="TRANSFER">Virement</option>
              </select>
            </div>
          </div>
        )}

        <div className="border-t border-neutral-200 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-neutral-500">
              Total de la commande : <span className="font-semibold text-ink">{total.toLocaleString("fr-FR")} F</span>
            </p>
            {type === "INVOICE" && advance > 0 && (
              <>
                <p className="text-sm text-neutral-500">
                  Avance reçue : <span className="font-semibold text-emerald-600">-{advance.toLocaleString("fr-FR")} F</span>
                </p>
                <p className="text-lg font-bold text-ink">
                  Solde restant : {remainingBalance.toLocaleString("fr-FR")} F
                </p>
              </>
            )}
            {!(type === "INVOICE" && advance > 0) && (
              <p className="text-lg font-bold text-ink">Total TTC : {total.toLocaleString("fr-FR")} F</p>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand hover:bg-brand-dark text-white font-medium px-5 py-2.5 transition-colors disabled:opacity-60 self-end"
          >
            {saving ? "Enregistrement..." : "Créer la facture"}
          </button>
        </div>
      </form>
    </div>
  );
}
