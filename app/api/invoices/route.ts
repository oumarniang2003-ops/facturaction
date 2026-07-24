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
  const { clientId, type, issueDate, dueDate, notes, lines, advanceReceived, paymentMethod, clientName, clientPhone, clientAddress } = body as {
    clientId: string;
    type: "QUOTE" | "INVOICE";
    issueDate?: string;
    dueDate?: string;
    notes?: string;
    lines: LineInput[];
    advanceReceived?: number;
    paymentMethod?: string;
    clientName?: string;
    clientPhone?: string;
    clientAddress?: string;
  };

  if (!clientId || !lines?.length) {
    return NextResponse.json({ error: "Client et lignes requis" }, { status: 400 });
  }

  let finalClientId = clientId;

  if (clientId === "new") {
    if (!clientName) {
      return NextResponse.json({ error: "Nom du client requis" }, { status: 400 });
    }
    const newClient = await prisma.client.create({
      data: {
        merchantId,
        name: clientName,
        phone: clientPhone || null,
        address: clientAddress || null,
      },
    });
    finalClientId = newClient.id;
  } else {
    // Sécurité : vérifie que le client appartient bien à ce commerçant
    const client = await prisma.client.findFirst({ where: { id: clientId, merchantId } });
    if (!client) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }
  }

  const { items, subtotal, vatTotal, total } = computeInvoiceTotals(lines);
  const number = await getNextInvoiceNumber(merchantId);

  // Match items with catalog products to retrieve costPrice and link productId
  const merchantProducts = await prisma.product.findMany({ where: { merchantId } });
  const dbItems = items.map((it) => {
    const matchedProduct = merchantProducts.find(
      (p) => p.name.toLowerCase().trim() === it.description.toLowerCase().trim()
    );
    return {
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      costPrice: matchedProduct ? Number(matchedProduct.costPrice) : 0,
      productId: matchedProduct ? matchedProduct.id : null,
      vatRate: it.vatRate,
      lineTotal: it.lineTotal,
    };
  });

  const invoice = await prisma.invoice.create({
    data: {
      merchantId,
      clientId: finalClientId,
      number,
      type: type ?? "INVOICE",
      status: "DRAFT",
      issueDate: issueDate ? new Date(issueDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes,
      subtotal,
      vatTotal,
      total,
      advanceReceived: advanceReceived ? Number(advanceReceived) : 0,
      paymentMethod,
      items: {
        create: dbItems,
      },
    },
    include: { items: true, client: true },
  });

  return NextResponse.json(invoice, { status: 201 });
}
