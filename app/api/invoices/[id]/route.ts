import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeInvoiceTotals, LineInput } from "@/lib/invoice-utils";
import { InvoiceStatus } from "@prisma/client";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const merchantId = (session as any).merchantId;

  const invoice = await prisma.invoice.findFirst({
    where: { id: params.id, merchantId },
    include: { client: true, items: true },
  });

  if (!invoice) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  return NextResponse.json(invoice);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const merchantId = (session as any).merchantId;
  const invoiceId = params.id;

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, merchantId },
  });

  if (!invoice) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

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
    const client = await prisma.client.findFirst({ where: { id: clientId, merchantId } });
    if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
  }

  const { items, subtotal, vatTotal, total } = computeInvoiceTotals(lines);

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

  // Calculate status based on updated total and advanceReceived
  const advance = advanceReceived ?? 0;
  let newStatus: InvoiceStatus = invoice.status;
  if (type === "INVOICE") {
    if (advance >= total) {
      newStatus = "PAID";
    } else if (advance > 0) {
      newStatus = "PARTIALLY_PAID";
    } else {
      newStatus = "SENT";
    }
  }

  // Use transaction to update old items and save invoice
  const updatedInvoice = await prisma.$transaction(async (tx) => {
    // Delete existing invoice items
    await tx.invoiceItem.deleteMany({
      where: { invoiceId },
    });

    // Update invoice fields
    return tx.invoice.update({
      where: { id: invoiceId },
      data: {
        clientId: finalClientId,
        type: type ?? "INVOICE",
        status: newStatus,
        issueDate: issueDate ? new Date(issueDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes,
        subtotal,
        vatTotal,
        total,
        advanceReceived: advance,
        paymentMethod: type === "INVOICE" ? paymentMethod : null,
        items: {
          create: dbItems,
        },
      },
    });
  });

  return NextResponse.json(updatedInvoice);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const merchantId = (session as any).merchantId;

  const invoice = await prisma.invoice.findFirst({
    where: { id: params.id, merchantId },
  });

  if (!invoice) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  await prisma.invoice.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
