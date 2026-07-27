"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Client = { id: string; name: string };
type Line = { description: string; quantity: number; unitPrice: number; costPrice: number; vatRate: number };

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [type, setType] = useState<"QUOTE" | "INVOICE">("INVOICE");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<Line[]>([
    { description: "", quantity: 1, unitPrice: 0, costPrice: 0, vatRate: 0 },
  ]);
  const [advanceReceived, setAdvanceReceived] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 1. Fetch CRM clients
    fetch("/api/clients")
      .then((r) => r.json())
      .then(setClients);

    // Fetch products
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);

    // 2. Fetch invoice details
    fetch(`/api/invoices/${invoiceId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Facture introuvable");
        return r.json();
      })
      .then((data) => {
        setClientId(data.clientId);
        setType(data.type);
        setIssueDate(data.issueDate.split("T")[0]);
        setLines(
          data.items.map((it: any) => ({
            description: it.description,
            quantity: Number(it.quantity),
            unitPrice: Number(it.unitPrice),
            costPrice: Number(it.costPrice) || 0,
            vatRate: Number(it.vatRate),
          }))
        );
        setAdvanceReceived(Number(data.advanceReceived) === 0 ? "" : Number(data.advanceReceived));
        setPaymentMethod(data.paymentMethod || "CASH");
        setLoading(false);
      })
      .catch((err) => {
        alert(err.message);
        router.push("/dashboard/invoices");
      });
  }, [invoiceId, router]);

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0, costPrice: 0, vatRate: 0 }]);
  }

  function removeLine(i: number) {
    if (lines.length > 1) {
      setLines((prev) => prev.filter((_, idx) => idx !== i));
    }
  }

  const total = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice * (1 + l.vatRate / 100), 0);
  const totalCost = lines.reduce((sum, l) => sum + l.quantity * l.costPrice, 0);
  const profit = total - totalCost;
  const marginPercent = total > 0 ? (profit / total) * 100 : 0;
  const advance = advanceReceived === "" ? 0 : Number(advanceReceived);
  const remainingBalance = Math.max(0, total - advance);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/invoices/${invoiceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        type,
        issueDate,
        lines,
        advanceReceived: advance,
        paymentMethod: type === "INVOICE" ? paymentMethod : null,
        clientName: clientId === "new" ? clientName : undefined,
        clientPhone: clientId === "new" ? clientPhone : undefined,
        clientAddress: clientId === "new" ? clientAddress : undefined,
      }),
    });
    setSaving(false);
    if (res.ok) router.push("/dashboard/invoices");
  }

  if (loading) {
    return <div className="text-sm text-neutral-500 py-6">Chargement des données du document...</div>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-ink mb-6">
        Modifier {type === "INVOICE" ? "la facture" : "le devis"}
      </h1>

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
              <option value="new" className="text-brand font-semibold">+ Nouveau client (Saisie rapide)</option>
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

        {clientId === "new" && (
          <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 space-y-4">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Informations du Nouveau Client</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">
                  Nom du client *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: NBS Electronic"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">
                  Téléphone du client
                </label>
                <input
                  type="text"
                  placeholder="Ex: +221 77 721 19 87"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">
                  Adresse du client
                </label>
                <input
                  type="text"
                  placeholder="Ex: Parcelles Assainies, Dakar"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
          {/* Table headers */}
          <div className="grid grid-cols-12 gap-2 text-xs font-bold text-neutral-400 mb-1 px-1">
            <div className="col-span-5">Désignation</div>
            <div className="col-span-2 text-center">Quantité</div>
            <div className="col-span-2 text-right">P. Unitaire (F)</div>
            <div className="col-span-2 text-right">P. Achat (F)</div>
            <div className="col-span-1 text-center">Act.</div>
          </div>

          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input
                placeholder="Désignation (ex: Réfrigérateur, Climatiseur...)"
                required
                className="col-span-5 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                value={line.description}
                list="products-datalist"
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = products.find(
                    (p) => p.name.toLowerCase() === val.toLowerCase()
                  );
                  if (matched) {
                    updateLine(i, {
                      description: val,
                      unitPrice: Number(matched.unitPrice) || 0,
                      costPrice: Number(matched.costPrice) || 0,
                      vatRate: Number(matched.vatRate) || 0,
                    });
                  } else {
                    updateLine(i, { description: val });
                  }
                }}
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
                className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-right"
                value={line.unitPrice}
                onChange={(e) => updateLine(i, { unitPrice: parseFloat(e.target.value) || 0 })}
              />
              <input
                type="number"
                min={0}
                step="1"
                placeholder="P. Achat"
                className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-right"
                value={line.costPrice}
                onChange={(e) => updateLine(i, { costPrice: parseFloat(e.target.value) || 0 })}
              />
              <div className="col-span-1 text-center">
                <button
                  type="button"
                  disabled={lines.length <= 1}
                  onClick={() => removeLine(i)}
                  className="text-rose-500 hover:text-rose-700 disabled:opacity-30 text-sm font-semibold p-1"
                  title="Supprimer la ligne"
                >
                  &times;
                </button>
              </div>
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

        <div className="border-t border-neutral-200 pt-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
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
              <p className="text-lg font-bold text-ink font-display">Total à régler : {total.toLocaleString("fr-FR")} F</p>
            )}

            {/* Live Cost & Profit Calculations */}
            <div className="mt-3 bg-neutral-50 rounded-xl p-3 border border-neutral-200 space-y-1.5 text-xs max-w-xs">
              <div className="flex justify-between gap-8 text-neutral-500 font-medium">
                <span>Coût d'achat estimé :</span>
                <span>{totalCost.toLocaleString("fr-FR")} F</span>
              </div>
              <div className="flex justify-between gap-8 text-neutral-600 font-bold">
                <span>Bénéfice net estimé :</span>
                <span className={profit >= 0 ? "text-emerald-600" : "text-rose-600"}>
                  {profit.toLocaleString("fr-FR")} F
                </span>
              </div>
              <div className="flex justify-between gap-8 text-neutral-400 text-[10px]">
                <span>Marge bénéficiaire :</span>
                <span>{marginPercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand hover:bg-brand-dark text-white font-medium px-5 py-2.5 transition-colors disabled:opacity-60 self-end"
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>

      {/* Datalist for autocomplete */}
      <datalist id="products-datalist">
        {products.map((p) => (
          <option key={p.id} value={p.name} />
        ))}
      </datalist>
    </div>
  );
}
