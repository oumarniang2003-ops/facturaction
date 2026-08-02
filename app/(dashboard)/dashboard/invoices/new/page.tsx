"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText, User, Calendar, CreditCard, ChevronLeft } from "lucide-react";
import Link from "next/link";

type Line = { description: string; quantity: number; unitPrice: number; costPrice: number; vatRate: number };
type Client = { id: string; name: string };

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [clientId, setClientId] = useState("new");
  const [clientName, setClientName] = useState("Client de passage");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [type, setType] = useState<"QUOTE" | "INVOICE">("INVOICE");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<Line[]>([
    { description: "", quantity: 1, unitPrice: 0, costPrice: 0, vatRate: 0 },
  ]);
  const [advanceReceived, setAdvanceReceived] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        setClients(data);
        const existingPassage = data.find(
          (c: any) => c.name.toLowerCase() === "client de passage"
        );
        if (existingPassage) {
          setClientId(existingPassage.id);
        }
      });

    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

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
        clientName: clientId === "new" ? clientName : undefined,
        clientPhone: clientId === "new" ? clientPhone : undefined,
        clientAddress: clientId === "new" ? clientAddress : undefined,
      }),
    });
    setSaving(false);
    if (res.ok) router.push("/dashboard/invoices");
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/invoices">
          <Button variant="outline" size="icon" className="h-9 w-9 border-neutral-200 bg-white">
            <ChevronLeft className="size-4 text-neutral-500" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Nouveau document</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Créez un devis ou une facture pour vos clients.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Settings */}
        <Card className="bg-white border-neutral-200 shadow-sm rounded-xl">
          <CardContent className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Client
              </label>
              <select
                required
                value={
                  clientId === "new" && clientName === "Client de passage"
                    ? "passage"
                    : clients.find((c) => c.id === clientId)?.name.toLowerCase() === "client de passage"
                    ? "passage"
                    : clientId
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "passage") {
                    const existingPassage = clients.find(
                      (c) => c.name.toLowerCase() === "client de passage"
                    );
                    if (existingPassage) {
                      setClientId(existingPassage.id);
                    } else {
                      setClientId("new");
                    }
                    setClientName("Client de passage");
                  } else if (val === "new") {
                    setClientId("new");
                    setClientName("");
                    setClientPhone("");
                    setClientAddress("");
                  } else {
                    setClientId(val);
                    setClientName("");
                  }
                }}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 h-10 text-sm font-medium outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 transition-all text-neutral-700 cursor-pointer"
              >
                <option value="passage">Client de passage (Vente directe)</option>
                <option value="new">+ Nouveau client (Saisir coordonnées)</option>
                {clients
                  .filter((c) => c.name.toLowerCase() !== "client de passage")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Type de document
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "QUOTE" | "INVOICE")}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 h-10 text-sm font-medium outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 transition-all text-neutral-700 cursor-pointer"
              >
                <option value="INVOICE">Facture</option>
                <option value="QUOTE">Devis</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Date d'émission
              </label>
              <Input
                type="date"
                required
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Temporary New Client Info */}
        {clientId === "new" && clientName !== "Client de passage" && (
          <Card className="bg-neutral-50/50 border-neutral-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="size-3.5 text-neutral-400" />
                <span>Informations du Nouveau Client</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500">Nom du client *</label>
                <Input
                  type="text"
                  required
                  placeholder="Ex: NBS Electronic"
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500">Téléphone</label>
                <Input
                  type="text"
                  placeholder="Ex: +221 77 721 19 87"
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500">Adresse</label>
                <Input
                  type="text"
                  placeholder="Ex: Parcelles Assainies, Dakar"
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Line Items Table */}
        <Card className="bg-white border-neutral-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-3 pt-5 px-5 border-b border-neutral-100 bg-neutral-50/30">
            <CardTitle className="text-sm font-bold text-ink">Détails des prestations / articles</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {/* Header Labels (Desktop only) */}
            <div className="hidden md:grid grid-cols-12 gap-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
              <div className="col-span-5">Description / Article</div>
              <div className="col-span-2 text-center">Quantité</div>
              <div className="col-span-2 text-right">P. Unitaire (F)</div>
              <div className="col-span-2 text-right">P. Achat (F)</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Rows list */}
            <div className="space-y-3">
              {lines.map((line, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-neutral-200 p-4 space-y-3 md:border-0 md:p-0 md:space-y-0 md:grid md:grid-cols-12 md:gap-3 md:items-center"
                >
                  <div className="flex items-center justify-between md:hidden border-b border-neutral-100 pb-2 mb-1">
                    <span className="text-xs font-bold text-neutral-500">Ligne {i + 1}</span>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={lines.length <= 1}
                      onClick={() => removeLine(i)}
                      className="text-rose-500 hover:text-rose-700 disabled:opacity-30 text-xs font-semibold h-7 py-0.5 px-2 border-neutral-200 bg-white rounded"
                    >
                      Supprimer
                    </Button>
                  </div>

                  <div className="col-span-5">
                    <Input
                      placeholder="Désignation (ex: Réfrigérateur, Climatiseur...)"
                      required
                      className="h-9 border-neutral-200 focus-visible:border-brand bg-white"
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
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 md:contents">
                    <div className="flex flex-col gap-1 md:contents">
                      <label className="block text-[10px] text-neutral-400 font-semibold md:hidden">Qté</label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Qté"
                        className="h-9 border-neutral-200 focus-visible:border-brand bg-white text-center md:col-span-2"
                        value={line.quantity}
                        onChange={(e) => updateLine(i, { quantity: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex flex-col gap-1 md:contents">
                      <label className="block text-[10px] text-neutral-400 font-semibold md:hidden">Vente (F)</label>
                      <Input
                        type="number"
                        min={0}
                        step="1"
                        placeholder="Vente"
                        className="h-9 border-neutral-200 focus-visible:border-brand bg-white text-right md:col-span-2"
                        value={line.unitPrice}
                        onChange={(e) => updateLine(i, { unitPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex flex-col gap-1 md:contents">
                      <label className="block text-[10px] text-neutral-400 font-semibold md:hidden">Achat (F)</label>
                      <Input
                        type="number"
                        min={0}
                        step="1"
                        placeholder="Achat"
                        className="h-9 border-neutral-200 focus-visible:border-brand bg-white text-right md:col-span-2"
                        value={line.costPrice}
                        onChange={(e) => updateLine(i, { costPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="hidden md:flex md:col-span-1 justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={lines.length <= 1}
                        onClick={() => removeLine(i)}
                        className="text-rose-500 hover:text-rose-700 disabled:opacity-30 h-8 w-8 p-0"
                        title="Supprimer la ligne"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-100 mt-2">
              <Button 
                type="button" 
                onClick={addLine} 
                variant="outline" 
                className="h-8 text-xs font-semibold border-neutral-300 hover:bg-neutral-50 bg-white rounded-lg flex items-center gap-1"
              >
                <Plus className="size-3.5" />
                <span>Ajouter une ligne</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment options for invoices */}
        {type === "INVOICE" && (
          <Card className="bg-neutral-50/50 border-neutral-200 shadow-sm rounded-xl">
            <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Acompte / Avance reçue (F CFA)
                </label>
                <Input
                  type="number"
                  min={0}
                  step="1"
                  placeholder="Ex: 5000 (laissez vide si 0)"
                  className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                  value={advanceReceived}
                  onChange={(e) => setAdvanceReceived(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Mode de paiement
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 h-10 text-sm font-medium outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 transition-all text-neutral-700 cursor-pointer"
                >
                  <option value="CASH">Espèces</option>
                  <option value="CHECK">Chèque</option>
                  <option value="WAVE">Wave</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                  <option value="CARD">Carte Bancaire</option>
                  <option value="TRANSFER">Virement</option>
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Totals & Submit */}
        <div className="border-t border-neutral-200 pt-5 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-1">
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Détails financiers</p>
            <p className="text-sm text-neutral-600">
              Total HT & Taxes : <span className="font-semibold text-ink">{total.toLocaleString("fr-FR")} F</span>
            </p>
            {type === "INVOICE" && advance > 0 && (
              <>
                <p className="text-sm text-neutral-600">
                  Avance reçue : <span className="font-semibold text-emerald-600">-{advance.toLocaleString("fr-FR")} F</span>
                </p>
                <p className="text-xl font-bold text-ink">
                  Solde restant : {remainingBalance.toLocaleString("fr-FR")} F
                </p>
              </>
            )}
            {!(type === "INVOICE" && advance > 0) && (
              <p className="text-xl font-bold text-ink font-display">Total à régler : {total.toLocaleString("fr-FR")} F</p>
            )}

            {/* Margin/Profit summary */}
            <div className="mt-3 bg-neutral-100/50 rounded-xl p-3 border border-neutral-200/60 space-y-1 text-xs max-w-xs">
              <div className="flex justify-between gap-8 text-neutral-500">
                <span>Coût d'achat estimé :</span>
                <span className="font-medium">{totalCost.toLocaleString("fr-FR")} F</span>
              </div>
              <div className="flex justify-between gap-8 text-neutral-700 font-bold">
                <span>Bénéfice estimé :</span>
                <span className={profit >= 0 ? "text-emerald-600" : "text-rose-600"}>
                  {profit.toLocaleString("fr-FR")} F
                </span>
              </div>
              <div className="flex justify-between gap-8 text-neutral-400 text-[10px]">
                <span>Marge estimée :</span>
                <span>{marginPercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={saving}
            className="h-10 px-6 font-semibold shadow-sm hover:shadow transition-all duration-200 rounded-lg self-end"
          >
            {saving ? "Enregistrement..." : type === "INVOICE" ? "Créer la facture" : "Créer le devis"}
          </Button>
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
