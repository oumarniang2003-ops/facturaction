"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Search, Users, FileText, Clock } from "lucide-react";
import { PaymentDialog } from "./PaymentDialog";
import { MerchantWhatsAppCell } from "./MerchantWhatsAppCell";

type Merchant = {
  id: string;
  businessName: string;
  slug: string;
  email: string;
  phone: string | null;
  createdAt: string;
  ownerName: string | null;
  ownerEmail: string;
  userCount: number;
  invoiceCount: number;
  clientCount: number;
  lastLoginAt: string | null;
  plan: "STARTER" | "PRO" | "BUSINESS";
  status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";
  paidUntil: string | null;
};

const statusLabels: Record<Merchant["status"], { label: string; className: string }> = {
  TRIALING: { label: "Essai", className: "bg-amber-100 text-amber-700 border-amber-200" },
  ACTIVE: { label: "Actif", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  PAST_DUE: { label: "Impayé", className: "bg-orange-100 text-orange-700 border-orange-200" },
  CANCELED: { label: "Suspendu", className: "bg-rose-100 text-rose-700 border-rose-200" },
};

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/merchants")
      .then((r) => r.json())
      .then(setMerchants)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function updateMerchant(id: string, data: { plan?: string; status?: string }) {
    setSavingId(id);
    setMerchants((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } as Merchant : m)));
    await fetch(`/api/admin/merchants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSavingId(null);
  }

  const filtered = merchants.filter((m) => {
    const term = search.toLowerCase();
    return (
      !term ||
      m.businessName.toLowerCase().includes(term) ||
      m.ownerEmail.toLowerCase().includes(term)
    );
  });

  const activeCount = merchants.filter((m) => m.status === "ACTIVE").length;
  const trialCount = merchants.filter((m) => m.status === "TRIALING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
            <Shield className="size-5 text-brand" />
          </div>
          <span>Commerçants inscrits</span>
        </h1>
        <p className="text-sm text-neutral-500 mt-1.5 font-semibold">
          Le paiement Stripe n&apos;est pas encore branché : activez ou suspendez
          manuellement l&apos;accès de chaque boutique depuis cette page.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-neutral-200/60 shadow-sm rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Boutiques</p>
          <p className="text-2xl font-display font-extrabold text-ink mt-1">{merchants.length}</p>
        </Card>
        <Card className="bg-white border-neutral-200/60 shadow-sm rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Actifs</p>
          <p className="text-2xl font-display font-extrabold text-emerald-600 mt-1">{activeCount}</p>
        </Card>
        <Card className="bg-white border-neutral-200/60 shadow-sm rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">En essai</p>
          <p className="text-2xl font-display font-extrabold text-amber-600 mt-1">{trialCount}</p>
        </Card>
        <Card className="bg-white border-neutral-200/60 shadow-sm rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Factures émises</p>
          <p className="text-2xl font-display font-extrabold text-ink mt-1">
            {merchants.reduce((acc, m) => acc + m.invoiceCount, 0)}
          </p>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="size-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Rechercher une boutique ou un email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 h-10 rounded-full border border-neutral-200 bg-white text-sm font-semibold outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 transition-all"
        />
      </div>

      <Card className="bg-white border-neutral-200/60 shadow-sm rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Boutique</TableHead>
              <TableHead>Propriétaire</TableHead>
              <TableHead>Inscrit le</TableHead>
              <TableHead>Dernière connexion</TableHead>
              <TableHead>Activité</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Payé jusqu&apos;au</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-sm text-neutral-400 font-semibold">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-sm text-neutral-400 font-semibold">
                  Aucun commerçant trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => {
                const status = statusLabels[m.status];
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-bold text-ink whitespace-normal">{m.businessName}</TableCell>
                    <TableCell className="whitespace-normal">
                      <p className="font-semibold text-neutral-700">{m.ownerName ?? "—"}</p>
                      <p className="text-xs text-neutral-400">{m.ownerEmail}</p>
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500 font-semibold">
                      {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500 font-semibold">
                      {m.lastLoginAt ? (
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-neutral-400" />
                          {new Date(m.lastLoginAt).toLocaleString("fr-FR")}
                        </span>
                      ) : (
                        <span className="text-neutral-400">Jamais connecté</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500 font-semibold">
                      <span className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <FileText className="size-3.5 text-neutral-400" /> {m.invoiceCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="size-3.5 text-neutral-400" /> {m.clientCount}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <select
                        value={m.plan}
                        disabled={savingId === m.id}
                        onChange={(e) => updateMerchant(m.id, { plan: e.target.value })}
                        className="rounded-lg border border-neutral-200 bg-white px-2.5 h-8 text-xs font-semibold outline-none focus-visible:border-brand transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <option value="STARTER">Starter</option>
                        <option value="PRO">Pro</option>
                        <option value="BUSINESS">Business</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <select
                        value={m.status}
                        disabled={savingId === m.id}
                        onChange={(e) => updateMerchant(m.id, { status: e.target.value })}
                        className={`rounded-full border px-2.5 h-8 text-xs font-bold outline-none transition-all disabled:opacity-50 cursor-pointer ${status.className}`}
                      >
                        <option value="TRIALING">Essai</option>
                        <option value="ACTIVE">Actif</option>
                        <option value="PAST_DUE">Impayé</option>
                        <option value="CANCELED">Suspendu</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500 font-semibold whitespace-nowrap">
                      {m.paidUntil ? new Date(m.paidUntil).toLocaleDateString("fr-FR") : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PaymentDialog
                          merchantId={m.id}
                          businessName={m.businessName}
                          onSaved={(data) =>
                            setMerchants((prev) =>
                              prev.map((x) => (x.id === m.id ? { ...x, ...data } as Merchant : x))
                            )
                          }
                        />
                        <MerchantWhatsAppCell
                          merchantId={m.id}
                          ownerName={m.ownerName}
                          businessName={m.businessName}
                          phone={m.phone}
                          plan={m.plan}
                          paidUntil={m.paidUntil}
                          onPhoneSaved={(phone) =>
                            setMerchants((prev) =>
                              prev.map((x) => (x.id === m.id ? { ...x, phone } : x))
                            )
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
