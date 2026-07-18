import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdfBuffer } from "@/lib/generate-invoice-pdf";
import { sendInvoiceEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const merchantId = (session as any).merchantId;
  const result = await generateInvoicePdfBuffer(params.id, merchantId);
  if (!result) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  const { invoice, pdfBuffer } = result;

  if (!invoice.client.email) {
    return NextResponse.json({ error: "Ce client n'a pas d'adresse email enregistrée." }, { status: 400 });
  }

  await sendInvoiceEmail({
    to: invoice.client.email,
    merchantName: invoice.merchant.businessName,
    invoiceNumber: invoice.number,
    total: Number(invoice.total),
    pdfBuffer,
  });

  // On passe la facture au statut "Envoyée" si elle était en brouillon
  if (invoice.status === "DRAFT") {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "SENT" },
    });
  }

  return NextResponse.json({ sent: true });
}
