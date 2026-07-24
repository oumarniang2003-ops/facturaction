"use client";

import { useEffect, useState } from "react";

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
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2"
        >
          + Nouveau client
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-200 p-4 mb-6 grid grid-cols-2 gap-3">
          <input required placeholder="Nom *" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="INDIVIDUAL">Particulier</option>
            <option value="BUSINESS">Professionnel</option>
          </select>
          <input placeholder="Email" type="email" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Téléphone" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Adresse" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input placeholder="Numéro de TVA / SIRET" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={form.vatNumber} onChange={(e) => setForm({ ...form, vatNumber: e.target.value })} />
          <textarea placeholder="Notes additionnelles (ex: préférences, détails...)" className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm" rows={2}
            value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button type="submit" className="col-span-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-semibold py-2">
            Enregistrer
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-left">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Adresse</th>
              <th className="px-4 py-3">N° TVA</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {clients.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-4 py-3 font-semibold text-ink">{c.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${c.type === "BUSINESS" ? "bg-brand/10 text-brand border-brand/20" : "bg-neutral-100 text-neutral-600 border-neutral-200"}`}>
                    {c.type === "BUSINESS" ? "Professionnel" : "Particulier"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-neutral-700">{c.email || "—"}</div>
                  <div className="text-xs text-neutral-400">{c.phone || ""}</div>
                </td>
                <td className="px-4 py-3 text-neutral-500 max-w-[200px] truncate" title={c.address || ""}>
                  {c.address || "—"}
                </td>
                <td className="px-4 py-3 text-neutral-500">{c.vatNumber || "—"}</td>
                <td className="px-4 py-3 text-neutral-500 max-w-[200px] truncate" title={c.notes || ""}>
                  {c.notes || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <p className="px-4 py-6 text-center text-neutral-500">Aucun client enregistré.</p>
        )}
      </div>
    </div>
  );
}
