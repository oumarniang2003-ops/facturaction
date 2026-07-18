"use client";

import { useEffect, useState } from "react";

type Client = { id: string; name: string; email?: string; phone?: string; type: string };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", type: "INDIVIDUAL" });
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
    setForm({ name: "", email: "", phone: "", type: "INDIVIDUAL" });
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
          <input required placeholder="Nom" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="INDIVIDUAL">Particulier</option>
            <option value="BUSINESS">Professionnel</option>
          </select>
          <input placeholder="Email" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Téléphone" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <button type="submit" className="col-span-2 rounded-lg bg-ink text-white text-sm font-medium py-2">
            Enregistrer
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
        {clients.map((c) => (
          <div key={c.id} className="px-4 py-3 flex justify-between text-sm">
            <span className="font-medium text-ink">{c.name}</span>
            <span className="text-neutral-500">{c.email || c.phone || "—"}</span>
          </div>
        ))}
        {clients.length === 0 && (
          <p className="px-4 py-6 text-center text-neutral-500 text-sm">Aucun client enregistré.</p>
        )}
      </div>
    </div>
  );
}
