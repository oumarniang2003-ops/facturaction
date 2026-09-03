export const PLAN_PRICES: Record<"STARTER" | "PRO" | "BUSINESS", number> = {
  STARTER: 0,
  PRO: 10000,
  BUSINESS: 25000,
};

export const PLAN_LABELS: Record<"STARTER" | "PRO" | "BUSINESS", string> = {
  STARTER: "Starter",
  PRO: "Pro",
  BUSINESS: "Business",
};

// Numéro Wave sur lequel le super admin reçoit les paiements d'abonnement manuels
export const WAVE_PAYMENT_NUMBER = "785430617";

// Normalise un numéro sénégalais (local ou avec indicatif) au format E.164 sans "+",
// tel qu'attendu par les liens wa.me. Renvoie null si le numéro est vide/inexploitable.
export function toWhatsAppNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("221")) return digits;
  if (digits.length === 9) return `221${digits}`;
  return digits;
}
