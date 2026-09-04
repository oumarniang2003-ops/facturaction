"use client";

import { useState } from "react";
import { Send, Check, Loader2 } from "lucide-react";

export function SendInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSend() {
    setStatus("sending");
    const res = await fetch(`/api/invoices/${invoiceId}/send`, { method: "POST" });
    setStatus(res.ok ? "sent" : "error");
  }

  if (status === "sent") {
    return (
      <span className="h-8 px-3 text-[11px] font-bold rounded-full bg-mint/10 text-mint inline-flex items-center gap-1.5 shrink-0">
        <Check className="size-3.5" />
        <span>Envoyée</span>
      </span>
    );
  }

  return (
    <button
      onClick={handleSend}
      disabled={status === "sending"}
      title="Envoyer par email"
      className="h-8 px-3 text-[11px] font-bold rounded-full border border-neutral-200 hover:bg-neutral-50 bg-white text-neutral-700 disabled:opacity-50 inline-flex items-center gap-1.5 shrink-0 transition-colors"
    >
      {status === "sending" ? (
        <Loader2 className="size-3.5 animate-spin text-neutral-400" />
      ) : (
        <Send className="size-3.5 text-neutral-400" />
      )}
      <span>{status === "error" ? "Réessayer" : "Envoyer"}</span>
    </button>
  );
}
