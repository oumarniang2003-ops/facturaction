import { prisma } from "./prisma";

/**
 * Génère le prochain numéro de facture pour un commerçant, de façon
 * séquentielle et sans trou (obligation légale dans de nombreux pays).
 * Format : FAC-2026-0001
 */
export async function getNextInvoiceNumber(merchantId: string): Promise<string> {
  const year = new Date().getFullYear();

  const counter = await prisma.invoiceCounter.upsert({
    where: { merchantId },
    create: { merchantId, year, lastNumber: 1 },
    update: {
      lastNumber: { increment: 1 },
      // Si on change d'année, on repart à 1 (géré côté appelant si besoin)
    },
  });

  const number = counter.year === year ? counter.lastNumber : 1;
  return `FAC-${year}-${String(number).padStart(4, "0")}`;
}

export type LineInput = {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number; // ex: 20 pour 20%
};

/**
 * Calcule le sous-total, la TVA totale et le total TTC d'une facture
 * à partir de ses lignes.
 */
export function computeInvoiceTotals(lines: LineInput[]) {
  let subtotal = 0;
  let vatTotal = 0;

  const items = lines.map((line) => {
    const lineSubtotal = line.quantity * line.unitPrice;
    const lineVat = lineSubtotal * (line.vatRate / 100);
    subtotal += lineSubtotal;
    vatTotal += lineVat;
    return {
      ...line,
      lineTotal: Number((lineSubtotal + lineVat).toFixed(2)),
    };
  });

  return {
    items,
    subtotal: Number(subtotal.toFixed(2)),
    vatTotal: Number(vatTotal.toFixed(2)),
    total: Number((subtotal + vatTotal).toFixed(2)),
  };
}
