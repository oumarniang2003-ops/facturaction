import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdfBuffer } from "@/lib/generate-invoice-pdf";
import { sendInvoiceEmail } from "@/lib/email";

/**
 * Route destinée à être appelée une fois par jour par un job planifié
 * (Vercel Cron, GitHub Actions, ou tout scheduler externe) :
 *
 *   0 8 * * *  curl -X POST https://votre-domaine.com/api/cron/reminders \
 *              -H "Authorization: Bearer $CRON_SECRET"
 *
 * Elle ne dépend d'aucune session utilisateur : c'est un job serveur qui
 * parcourt TOUS les commerçants, chacun isolé par son propre merchantId
 * dans les requêtes qu'elle déclenche (generateInvoicePdfBuffer, etc.)
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();

  // 1. Marque comme "en retard" toute facture envoyée dont l'échéance est dépassée
  await prisma.invoice.updateMany({
    where: { status: "SENT", dueDate: { lt: now } },
    data: { status: "OVERDUE" },
  });

  // 2. Récupère toutes les factures en retard, avec le client et le commerçant
  const overdueInvoices = await prisma.invoice.findMany({
    where: { status: "OVERDUE" },
    include: { client: true, merchant: true },
  });

  let sentCount = 0;
  const errors: string[] = [];

  for (const invoice of overdueInvoices) {
    if (!invoice.client.email) continue;

    try {
      const result = await generateInvoicePdfBuffer(invoice.id, invoice.merchantId);
      if (!result) continue;

      await sendInvoiceEmail({
        to: invoice.client.email,
        merchantName: invoice.merchant.businessName,
        invoiceNumber: invoice.number,
        total: Number(invoice.total),
        pdfBuffer: result.pdfBuffer,
        isReminder: true,
      });
      sentCount++;
    } catch (err: any) {
      errors.push(`${invoice.number}: ${err.message}`);
    }
  }

  return NextResponse.json({ processed: overdueInvoices.length, sent: sentCount, errors });
}
