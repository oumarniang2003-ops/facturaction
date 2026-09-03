"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Mail, Phone, MapPin, Users, X } from "lucide-react";

type Client = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: string;
  address?: string;
  vatNumber?: string;
  notes?: string;
  invoiceCount: number;
  totalInvoiced: number;
};

const avatarStyles = [
  { bg: "bg-brand/10", text: "text-brand" },
  { bg: "bg-mint/10", text: "text-mint" },
  { bg: "bg-amber/10", text: "text-amber" },
];

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: "INDIVIDUAL",
    address: "",
    vatNumber: "",
    notes: "",
  });
  const [open, setOpen] = useState(false);

  function load() {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({
      name: "",
      email: "",
      phone: "",
      type: "INDIVIDUAL",
      address: "",
      vatNumber: "",
      notes: "",
    });
    setOpen(false);
    load();
  }

  const filteredClients = clients.filter((c) => {
    const term = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term)) ||
      (c.vatNumber && c.vatNumber.toLowerCase().includes(term));

    const matchesType = filterType === "ALL" ? true : c.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Clients</h1>
          <p className="text-sm text-neutral-500 mt-1.5">
            {clients.length} client{clients.length > 1 ? "s" : ""} enregistré{clients.length > 1 ? "s" : ""}.
          </p>
        </div>
        <Button
          onClick={() => setOpen(!open)}
          className="h-10 px-5 font-bold flex items-center gap-2 shadow-md shadow-brand/20 hover:opacity-95 transition-all duration-200 rounded-full bg-gradient-to-r from-brand to-[#7C6FF0] text-white"
        >
          <Plus className="size-4.5" />
          <span>Nouveau client</span>
        </Button>
      </div>

      {open && (
        <Card className="p-6 border border-neutral-200/60 bg-white shadow-sm rounded-2xl animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-neutral-100/60">
            <h2 className="text-sm font-bold text-ink">Créer une fiche client</h2>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors font-bold flex items-center gap-1"
            >
              <X className="size-3.5" />
              <span>Fermer</span>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Nom complet ou raison sociale *</label>
              <Input
                required
                placeholder="Ex: Aminata Diop, Sarr Électronique"
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Type de client</label>
              <select
                className="rounded-full border border-neutral-200 bg-white px-4 h-10 text-sm outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 transition-all font-semibold text-neutral-700 cursor-pointer"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="INDIVIDUAL">Particulier</option>
                <option value="BUSINESS">Professionnel</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Adresse email</label>
              <Input
                placeholder="Ex: contact@email.com"
                type="email"
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Numéro de téléphone</label>
              <Input
                placeholder="Ex: 77 123 45 67"
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Adresse postale</label>
              <Input
                placeholder="Ex: Sacré-Cœur 3, Dakar"
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Numéro de TVA / NINEA</label>
              <Input
                placeholder="Ex: SN-DKR-2024-B-1234"
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                value={form.vatNumber}
                onChange={(e) => setForm({ ...form, vatNumber: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Notes additionnelles</label>
              <textarea
                placeholder="Préférences de facturation, détails de livraison, etc."
                className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 outline-none transition-all resize-none bg-white min-h-[80px] font-semibold"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <Button
              type="submit"
              className="md:col-span-2 h-11 font-bold shadow-md shadow-brand/20 hover:opacity-95 transition-all duration-200 rounded-full bg-gradient-to-r from-brand to-[#7C6FF0] text-white"
            >
              Enregistrer le client
            </Button>
          </form>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input
            placeholder="Rechercher par nom, email..."
            className="pl-10 h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full font-semibold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-full border border-neutral-200 bg-white px-4 h-10 text-xs outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 w-full sm:w-44 transition-all font-bold text-neutral-600 cursor-pointer"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="ALL">Tous les types</option>
          <option value="INDIVIDUAL">Particuliers</option>
          <option value="BUSINESS">Professionnels</option>
        </select>
      </div>

      {filteredClients.length === 0 ? (
        <Card className="bg-white border-neutral-200/60 shadow-sm rounded-2xl">
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center mb-3 text-neutral-400 border border-neutral-100">
              <Users className="size-6" />
            </div>
            <h3 className="text-sm font-bold text-ink">Aucun client trouvé</h3>
            <p className="text-xs text-neutral-400 max-w-[280px] mt-1">
              {clients.length === 0
                ? "Ajoutez votre premier client pour commencer à créer des factures et devis."
                : "Aucun résultat ne correspond à vos critères de recherche."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((c, i) => {
            const avatar = avatarStyles[i % avatarStyles.length];
            return (
              <Card key={c.id} className="bg-white border-neutral-200/60 rounded-2xl p-5 shadow-none">
                <div className="flex items-center gap-3 mb-3.5">
                  <div className={`w-10 h-10 rounded-full ${avatar.bg} ${avatar.text} flex items-center justify-center text-sm font-bold shrink-0`}>
                    {initialsOf(c.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink truncate">{c.name}</p>
                    <p className="text-[11px] text-neutral-400 font-semibold">
                      {c.type === "BUSINESS" ? "Professionnel" : "Particulier"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-neutral-500 font-semibold min-h-[36px]">
                  {c.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3 text-neutral-400 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="size-3 text-neutral-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3 text-neutral-400 shrink-0" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                  {!c.phone && !c.email && !c.address && <span className="text-neutral-300">Aucune coordonnée renseignée</span>}
                </div>

                <div className="flex justify-between items-center mt-3.5 pt-3.5 border-t border-neutral-100/60">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total facturé</span>
                  <span className="font-display text-sm font-bold text-ink">
                    {c.totalInvoiced.toLocaleString("fr-FR")} F
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
