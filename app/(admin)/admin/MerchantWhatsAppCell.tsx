"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { WhatsAppReminderButton } from "./WhatsAppReminderButton";

type Plan = "STARTER" | "PRO" | "BUSINESS";

export function MerchantWhatsAppCell({
  merchantId,
  ownerName,
  businessName,
  phone,
  plan,
  paidUntil,
  onPhoneSaved,
}: {
  merchantId: string;
  ownerName: string | null;
  businessName: string;
  phone: string | null;
  plan: Plan;
  paidUntil: string | null;
  onPhoneSaved: (phone: string) => void;
}) {
  const [editing, setEditing] = useState(!phone);
  const [value, setValue] = useState(phone ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (value.trim().length < 6) return;
    setSaving(true);
    const res = await fetch(`/api/admin/merchants/${merchantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: value.trim() }),
    });
    setSaving(false);
    if (res.ok) {
      onPhoneSaved(value.trim());
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="tel"
          autoFocus
          placeholder="77 123 45 67"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="w-28 rounded-lg border border-neutral-200 px-2.5 h-8 text-xs font-semibold outline-none focus:border-brand focus:ring-3 focus:ring-brand/20"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving || value.trim().length < 6}
          title="Enregistrer le numéro"
          className="size-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center hover:bg-brand/20 disabled:opacity-40 shrink-0"
        >
          <Check className="size-3.5" />
        </button>
        {phone && (
          <button
            type="button"
            onClick={() => {
              setValue(phone);
              setEditing(false);
            }}
            title="Annuler"
            className="size-8 rounded-lg text-neutral-400 flex items-center justify-center hover:bg-neutral-100 shrink-0"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <WhatsAppReminderButton
        ownerName={ownerName}
        businessName={businessName}
        phone={phone}
        plan={plan}
        paidUntil={paidUntil}
      />
      <button
        type="button"
        onClick={() => setEditing(true)}
        title="Modifier le numéro"
        className="size-8 rounded-lg text-neutral-400 flex items-center justify-center hover:bg-neutral-100 shrink-0"
      >
        <Pencil className="size-3.5" />
      </button>
    </div>
  );
}
