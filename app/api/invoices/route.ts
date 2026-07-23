import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNextInvoiceNumber, computeInvoiceTotals, LineInput } from "@/lib/invoice-utils";

// GET : liste des factures du commerçant connecté UNIQUEMENT
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const merchantId = (session as any).merchantId;

  const invoices = await prisma.invoice.findMany({
    where: { merchantId }, // <- isolation multi-tenant
    include: { client: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invoices);
}

// POST : création d'une facture (devis ou facture) pour le commerçant connecté
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const merchantId = (session as any).merchantId;
  const body = await req.json();
  const { clientId, type, dueDate, notes, lines, advanceReceived, paymentMethod } = body as {
    clientId: string;
    type: "QUOTE" | "INVOICE";
    dueDate?: string;
    notes?: string;
    lines: LineInput[];
    advanceReceived?: number;
    paymentMethod?: string;
  };

  if (!clientId || !lines?.length) {
    return NextResponse.json({ error: "Client et lignes requis" }, { status: 400 });
  }

  // Sécurité : vérifie que le client appartient bien à ce commerçant
  const client = await prisma.client.findFirst({ where: { id: clientId, merchantId } });
  if (!client) {
    return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
  }

  const { items, subtotal, vatTotal, total } = computeInvoiceTotals(lines);
  const number = await getNextInvoiceNumber(merchantId);

  const invoice = await prisma.invoice.create({
    data: {
      merchantId,
      clientId,
      number,
      type: type ?? "INVOICE",
      status: "DRAFT",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes,
      subtotal,
      vatTotal,
      total,
      advanceReceived: advanceReceived ? Number(advanceReceived) : 0,
      paymentMethod,
      items: {
        create: items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          vatRate: it.vatRate,
          lineTotal: it.lineTotal,
        })),
      },
    },
    include: { items: true, client: true },
  });

  return NextResponse.json(invoice, { status: 201 });
}
