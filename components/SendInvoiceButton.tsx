"use client";

import { useState } from "react";

export function SendInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSend() {
    setStatus("sending");
    const res = await fetch(`/api/invoices/${invoiceId}/send`, { method: "POST" });
    setStatus(res.ok ? "sent" : "error");
  }

  if (status === "sent") return <span className="text-brand text-sm">Envoyée ✓</span>;

  return (
    <button
      onClick={handleSend}
      disabled={status === "sending"}
      className="text-sm text-neutral-500 hover:text-brand disabled:opacity-50"
    >
      {status === "sending" ? "Envoi..." : status === "error" ? "Échec, réessayer" : "Envoyer"}
    </button>
  );
}
