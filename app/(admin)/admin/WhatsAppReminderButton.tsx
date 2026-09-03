"use client";

import { MessageCircle } from "lucide-react";
import { PLAN_LABELS, PLAN_PRICES, WAVE_PAYMENT_NUMBER, toWhatsAppNumber } from "@/lib/plans";

type Plan = "STARTER" | "PRO" | "BUSINESS";

function buildMessage({
  ownerName,
  businessName,
  plan,
  paidUntil,
}: {
  ownerName: string | null;
  businessName: string;
  plan: Plan;
  paidUntil: string | null;
}) {
  const price = PLAN_PRICES[plan];
  const greeting = ownerName ? `Bonjour ${ownerName}` : "Bonjour";

  let statusLine: string;
  if (price === 0) {
    statusLine = "Vous êtes sur le forfait gratuit Starter, aucun paiement n'est requis.";
  } else if (!paidUntil) {
    statusLine = "Aucun paiement n'a encore été enregistré pour votre abonnement.";
  } else {
    const until = new Date(paidUntil);
    const days = Math.ceil((until.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    statusLine =
      days >= 0
        ? `Votre abonnement est valide jusqu'au ${until.toLocaleDateString("fr-FR")} (${days} jour${days > 1 ? "s" : ""} restant${days > 1 ? "s" : ""}).`
        : `Votre abonnement a expiré le ${until.toLocaleDateString("fr-FR")}, merci de le renouveler.`;
  }

  const lines = [
    `${greeting} 👋`,
    "",
    `Petit point sur votre abonnement Factura (${PLAN_LABELS[plan]}) pour ${businessName} :`,
    "",
    statusLine,
  ];

  if (price > 0) {
    lines.push(
      "",
      `💰 Montant : ${price.toLocaleString("fr-FR")} FCFA / mois`,
      `📲 Pour renouveler, envoyez ce montant par Wave au ${WAVE_PAYMENT_NUMBER}, puis répondez-moi ici pour confirmation.`
    );
  }

  lines.push("", "Merci pour votre confiance !");

  return lines.join("\n");
}

export function WhatsAppReminderButton({
  ownerName,
  businessName,
  phone,
  plan,
  paidUntil,
}: {
  ownerName: string | null;
  businessName: string;
  phone: string | null;
  plan: Plan;
  paidUntil: string | null;
}) {
  const waNumber = toWhatsAppNumber(phone);

  if (!waNumber) {
    return (
      <span
        className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-bold rounded-full border border-neutral-100 text-neutral-300 cursor-not-allowed"
        title="Numéro de téléphone manquant pour cette boutique"
      >
        <MessageCircle className="size-3.5" />
        WhatsApp
      </span>
    );
  }

  const message = buildMessage({ ownerName, businessName, plan, paidUntil });
  const href = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-bold rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
    >
      <MessageCircle className="size-3.5" />
      WhatsApp
    </a>
  );
}
