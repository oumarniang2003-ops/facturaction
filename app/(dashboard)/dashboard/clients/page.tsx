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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Clients</h1>
        <Button
          onClick={() => setOpen(!open)}
          variant="brand"
          className="h-9 px-4"
        >
          + Nouveau client
        </Button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-200 p-4 mb-6 grid grid-cols-2 gap-3">
          <Input required placeholder="Nom *" className="h-9 border-neutral-300"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="rounded-lg border border-neutral-300 bg-transparent px-3 h-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="INDIVIDUAL">Particulier</option>
            <option value="BUSINESS">Professionnel</option>
          </select>
          <Input placeholder="Email" type="email" className="h-9 border-neutral-300"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Téléphone" className="h-9 border-neutral-300"
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input placeholder="Adresse" className="h-9 border-neutral-300"
            value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input placeholder="Numéro de TVA / SIRET" className="h-9 border-neutral-300"
            value={form.vatNumber} onChange={(e) => setForm({ ...form, vatNumber: e.target.value })} />
          <textarea placeholder="Notes additionnelles (ex: préférences, détails...)" className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none" rows={2}
            value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button type="submit" variant="brand" className="col-span-2 h-9 font-semibold">
            Enregistrer
          </Button>
        </form>
      )}

      <Card className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-none">
        <Table>
          <TableHeader className="bg-neutral-50 text-neutral-500 text-left">
            <TableRow>
              <TableHead className="px-4 py-3 font-semibold text-neutral-600">Nom</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-neutral-600">Type</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-neutral-600">Contact</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-neutral-600">Adresse</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-neutral-600">N° TVA</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-neutral-600">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-neutral-100">
            {clients.map((c) => (
              <TableRow key={c.id} className="hover:bg-neutral-50/50 transition-colors">
                <TableCell className="px-4 py-3 font-semibold text-ink">{c.name}</TableCell>
                <TableCell className="px-4 py-3">
                  <Badge variant={c.type === "BUSINESS" ? "default" : "outline"} className={c.type === "BUSINESS" ? "bg-brand/10 text-brand hover:bg-brand/20 border-brand/20 rounded-full font-semibold px-2.5 py-0.5 h-auto text-xs" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border-neutral-200 rounded-full font-semibold px-2.5 py-0.5 h-auto text-xs"}>
                    {c.type === "BUSINESS" ? "Professionnel" : "Particulier"}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="text-neutral-700">{c.email || "—"}</div>
                  <div className="text-xs text-neutral-400">{c.phone || ""}</div>
                </TableCell>
                <TableCell className="px-4 py-3 text-neutral-500 max-w-[200px] truncate" title={c.address || ""}>
                  {c.address || "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-neutral-500">{c.vatNumber || "—"}</TableCell>
                <TableCell className="px-4 py-3 text-neutral-500 max-w-[200px] truncate" title={c.notes || ""}>
                  {c.notes || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {clients.length === 0 && (
          <p className="px-4 py-6 text-center text-neutral-500">Aucun client enregistré.</p>
        )}
      </Card>
    </div>
  );
}
