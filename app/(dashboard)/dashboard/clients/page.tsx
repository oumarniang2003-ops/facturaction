"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, User, Building, Mail, Phone, MapPin, Users, FileText } from "lucide-react";

type Client = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: string;
  address?: string;
  vatNumber?: string;
  notes?: string;
};

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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-ink">Clients</h1>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full font-semibold text-xs px-2.5 py-0.5">
              {clients.length} {clients.length <= 1 ? "enregistré" : "enregistrés"}
            </Badge>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Gérez les fiches d'informations de vos clients particuliers et professionnels, et suivez leurs coordonnées.
          </p>
        </div>
        <Button
          onClick={() => setOpen(!open)}
          variant="brand"
          className="h-10 px-4 font-semibold shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 rounded-lg"
        >
          <Plus className="size-4" />
          <span>Nouveau client</span>
        </Button>
      </div>

      {/* Slideout/Drawer Card Form */}
      {open && (
        <Card className="p-5 border border-neutral-200 bg-white shadow-sm rounded-xl animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
              <User className="size-4 text-brand" /> Créer une fiche client
            </h2>
            <button 
              onClick={() => setOpen(false)} 
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors font-medium"
            >
              Fermer
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500">Nom complet ou raison sociale *</label>
              <Input 
                required 
                placeholder="Ex: Jean Dupont, Acma Corp" 
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500">Type de client</label>
              <select 
                className="rounded-lg border border-neutral-200 bg-white px-3 h-10 text-sm outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 transition-all font-medium text-neutral-700"
                value={form.type} 
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="INDIVIDUAL">Particulier (INDIVIDUAL)</option>
                <option value="BUSINESS">Professionnel (BUSINESS)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500">Adresse email</label>
              <Input 
                placeholder="Ex: contact@email.com" 
                type="email" 
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500">Numéro de téléphone</label>
              <Input 
                placeholder="Ex: +33 6 12 34 56 78" 
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500">Adresse postale</label>
              <Input 
                placeholder="Ex: 12 Rue de Rivoli, 75001 Paris" 
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                value={form.address} 
                onChange={(e) => setForm({ ...form, address: e.target.value })} 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500">Numéro de TVA / SIRET</label>
              <Input 
                placeholder="Ex: FR 12 345 678 901" 
                className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                value={form.vatNumber} 
                onChange={(e) => setForm({ ...form, vatNumber: e.target.value })} 
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-neutral-500">Notes additionnelles</label>
              <textarea 
                placeholder="Préférences de facturation, détails de livraison, etc." 
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 outline-none transition-all resize-none bg-white min-h-[80px]" 
                rows={2}
                value={form.notes} 
                onChange={(e) => setForm({ ...form, notes: e.target.value })} 
              />
            </div>
            <Button 
              type="submit" 
              variant="brand" 
              className="md:col-span-2 h-10 font-semibold shadow-sm hover:shadow transition-all duration-200 rounded-lg"
            >
              Enregistrer le client
            </Button>
          </form>
        </Card>
      )}

      {/* Main Clients List Card */}
      <Card className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-neutral-100 bg-neutral-50/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <Input
              placeholder="Rechercher par nom, email..."
              className="pl-9 h-9 border-neutral-200 focus-visible:border-brand bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              className="rounded-lg border border-neutral-200 bg-white px-3 h-9 text-xs outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 w-full sm:w-40 transition-all font-semibold text-neutral-600 cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">Tous les types</option>
              <option value="INDIVIDUAL">Particuliers</option>
              <option value="BUSINESS">Professionnels</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <Table>
          <TableHeader className="bg-neutral-50/75 border-b border-neutral-100">
            <TableRow>
              <TableHead className="px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider h-10">Nom</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider h-10">Type</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider h-10">Contact</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider h-10">Adresse</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider h-10">N° TVA</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider h-10">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-neutral-100">
            {filteredClients.map((c) => (
              <TableRow key={c.id} className="hover:bg-neutral-50/40 transition-colors">
                <TableCell className="px-4 py-3 font-semibold text-ink flex items-center gap-2.5 min-h-[44px]">
                  {c.type === "BUSINESS" ? (
                    <Building className="size-4 text-emerald-600 shrink-0" />
                  ) : (
                    <User className="size-4 text-blue-600 shrink-0" />
                  )}
                  <span>{c.name}</span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge 
                    variant="outline" 
                    className={
                      c.type === "BUSINESS" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50 flex items-center gap-1 w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold" 
                        : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100/50 flex items-center gap-1 w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    }
                  >
                    {c.type === "BUSINESS" ? "Professionnel" : "Particulier"}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3">
                  {c.email ? (
                    <div className="flex items-center gap-1.5 text-neutral-700 text-xs">
                      <Mail className="size-3 text-neutral-400 shrink-0" />
                      <span>{c.email}</span>
                    </div>
                  ) : null}
                  {c.phone ? (
                    <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] mt-0.5">
                      <Phone className="size-3 text-neutral-400 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  ) : null}
                  {!c.email && !c.phone && <span className="text-neutral-400">—</span>}
                </TableCell>
                <TableCell className="px-4 py-3 text-neutral-600 max-w-[200px] truncate" title={c.address || ""}>
                  {c.address ? (
                    <div className="flex items-center gap-1.5 text-xs">
                      <MapPin className="size-3 text-neutral-400 shrink-0" />
                      <span>{c.address}</span>
                    </div>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 text-neutral-600 font-mono text-xs">
                  {c.vatNumber || <span className="text-neutral-400 font-sans">—</span>}
                </TableCell>
                <TableCell className="px-4 py-3 text-neutral-500 max-w-[200px] truncate" title={c.notes || ""}>
                  {c.notes ? (
                    <div className="flex items-center gap-1.5 text-xs">
                      <FileText className="size-3 text-neutral-400 shrink-0" />
                      <span>{c.notes}</span>
                    </div>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
            <div className="p-3 bg-neutral-50 rounded-full text-neutral-400 mb-3 border border-neutral-100">
              <Users className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-ink">Aucun client trouvé</h3>
            <p className="text-xs text-neutral-400 max-w-[280px] mt-1">
              {clients.length === 0
                ? "Ajoutez votre premier client pour commencer à créer des factures et devis."
                : "Aucun résultat ne correspond à vos critères de recherche."}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
