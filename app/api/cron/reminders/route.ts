import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdfBuffer } from "@/lib/generate-invoice-pdf";
import { sendInvoiceEmail } from "@/lib/email";

/**
 * Route destinée à être appelée une fois par jour par un job planifié.
 * Vercel Cron (voir vercel.json) déclenche en GET et injecte automatiquement
 * `Authorization: Bearer $CRON_SECRET`. POST reste supporté pour un
 * déclenchement manuel ou un scheduler externe (GitHub Actions, cron-job.org) :
 *
 *   curl -X POST https://votre-domaine.com/api/cron/reminders \
 *        -H "Authorization: Bearer $CRON_SECRET"
 *
 * Elle ne dépend d'aucune session utilisateur : c'est un job serveur qui
 * parcourt TOUS les commerçants, chacun isolé par son propre merchantId
 * dans les requêtes qu'elle déclenche (generateInvoicePdfBuffer, etc.)
 */
export async function GET(req: Request) {
  return runReminders(req);
}

export async function POST(req: Request) {
  return runReminders(req);
}

// Espace les rappels pour ne pas spammer le client d'un email identique chaque jour
const REMINDER_INTERVAL_DAYS = 3;

async function runReminders(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();
  const reminderCutoff = new Date(now.getTime() - REMINDER_INTERVAL_DAYS * 24 * 60 * 60 * 1000);

  // 1. Marque comme "en retard" toute facture envoyée dont l'échéance est dépassée
  await prisma.invoice.updateMany({
    where: { status: "SENT", dueDate: { lt: now } },
    data: { status: "OVERDUE" },
  });

  // 2. Récupère les factures en retard qui n'ont jamais été relancées, ou
  //    dont le dernier rappel date d'au moins REMINDER_INTERVAL_DAYS jours
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: "OVERDUE",
      OR: [{ lastReminderSentAt: null }, { lastReminderSentAt: { lt: reminderCutoff } }],
    },
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
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { lastReminderSentAt: now },
      });
      sentCount++;
    } catch (err: any) {
      errors.push(`${invoice.number}: ${err.message}`);
    }
  }

  return NextResponse.json({ processed: overdueInvoices.length, sent: sentCount, errors });
}
