import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, InvoiceStatus } from "@prisma/client";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const merchantId = (session as any).merchantId;
  const invoiceId = params.id;

  // Retrieve invoice
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, merchantId },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  const body = await req.json();
  const { amount, method, paidAt } = body as {
    amount: number;
    method: PaymentMethod;
    paidAt?: string;
  };

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
  }

  if (!Object.values(PaymentMethod).includes(method)) {
    return NextResponse.json({ error: "Méthode de paiement invalide" }, { status: 400 });
  }

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount,
      method,
      paidAt: paidAt ? new Date(paidAt) : undefined,
    },
  });

  // Calculate new advanceReceived and status
  const currentTotal = Number(invoice.total);
  const newAdvance = Number(invoice.advanceReceived) + amount;

  let newStatus: InvoiceStatus = invoice.status;
  if (newAdvance >= currentTotal) {
    newStatus = "PAID";
  } else if (newAdvance > 0) {
    newStatus = "PARTIALLY_PAID";
  }

  // Update invoice
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      advanceReceived: newAdvance,
      status: newStatus,
      paymentMethod: method,
    },
  });

  return NextResponse.json({ success: true, payment });
}
