import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNextInvoiceNumber, computeInvoiceTotals } from "@/lib/invoice-utils";

// Vente rapide : le commerçant vient de vendre un produit physiquement
// (en boutique) et veut juste enregistrer ça en 1 clic. Cette route :
// 1. Crée la facture (marquée directement PAYÉE, avec un paiement enregistré)
// 2. Décrémente le stock du produit si le suivi de stock est activé
// 3. Calcule et renvoie le bénéfice réalisé (prix de vente - prix d'achat)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const merchantId = (session as any).merchantId;
  const body = await req.json();
  const {
    productId,
    quantity,
    sellPrice, // optionnel : permet de vendre à un prix différent du prix catalogue
    advanceReceived, // optionnel : montant déjà encaissé si different du total (vente a credit/partielle)
    paymentMethod,
    clientId,
    clientName,
    clientPhone,
  } = body as {
    productId: string;
    quantity: number;
    sellPrice?: number;
    advanceReceived?: number;
    paymentMethod?: string;
    clientId?: string;
    clientName?: string;
    clientPhone?: string;
  };

  if (!productId || !quantity || quantity <= 0) {
    return NextResponse.json({ error: "Produit et quantité requis" }, { status: 400 });
  }

  if (sellPrice === undefined || sellPrice === null || Number(sellPrice) <= 0) {
    return NextResponse.json({ error: "Le prix de vente est requis." }, { status: 400 });
  }

  const product = await prisma.product.findFirst({ where: { id: productId, merchantId } });
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  if (product.trackStock && product.stockQty < quantity) {
    return NextResponse.json(
      { error: `Stock insuffisant : il ne reste que ${product.stockQty} en stock.` },
      { status: 400 }
    );
  }

  // Client : soit un client existant, soit un client "de passage" créé à la volée,
  // soit un client générique "Vente comptoir" si rien n'est précisé.
  let finalClientId = clientId;

  if (!finalClientId || finalClientId === "new") {
    if (clientName) {
      const newClient = await prisma.client.create({
        data: { merchantId, name: clientName, phone: clientPhone || null },
      });
      finalClientId = newClient.id;
    } else {
      // Client générique réutilisé pour les ventes comptoir sans identité précisée
      const existingCounterClient = await prisma.client.findFirst({
        where: { merchantId, name: "Vente comptoir" },
      });
      const counterClient =
        existingCounterClient ??
        (await prisma.client.create({ data: { merchantId, name: "Vente comptoir" } }));
      finalClientId = counterClient.id;
    }
  } else {
    const client = await prisma.client.findFirst({ where: { id: finalClientId, merchantId } });
    if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
  }

  const unitPrice = Number(sellPrice);
  const costPrice = Number(product.costPrice);
  const vatRate = Number(product.vatRate);

  const { items, subtotal, vatTotal, total } = computeInvoiceTotals([
    { description: product.name, quantity, unitPrice, vatRate },
  ]);

  // Avance encaissée : par défaut le total (vente immédiate classique),
  // mais peut être inférieure si le client ne paie qu'une partie maintenant.
  const advance = advanceReceived === undefined || advanceReceived === null
    ? total
    : Math.min(Math.max(0, Number(advanceReceived)), total);
  const remaining = Math.max(0, total - advance);
  const status = advance >= total ? "PAID" : advance > 0 ? "PARTIALLY_PAID" : "SENT";

  const number = await getNextInvoiceNumber(merchantId);

  const invoice = await prisma.invoice.create({
    data: {
      merchantId,
      clientId: finalClientId,
      number,
      type: "INVOICE",
      status,
      subtotal,
      vatTotal,
      total,
      advanceReceived: advance,
      paymentMethod: paymentMethod || "CASH",
      items: {
        create: items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          costPrice,
          productId: product.id,
          vatRate: it.vatRate,
          lineTotal: it.lineTotal,
        })),
      },
      ...(advance > 0
        ? { payments: { create: { amount: advance, method: (paymentMethod as any) || "CASH" } } }
        : {}),
    },
    include: { items: true, client: true },
  });

  // Décrémente le stock et journalise le mouvement
  if (product.trackStock) {
    await prisma.$transaction([
      prisma.product.update({
        where: { id: product.id },
        data: { stockQty: { decrement: quantity } },
      }),
      prisma.stockMovement.create({
        data: { productId: product.id, quantity: -quantity, reason: "Vente rapide" },
      }),
    ]);
  }

  // Bénéfice = (prix de vente - prix d'achat) × quantité, hors TVA
  // (la TVA collectée n'est pas un bénéfice, elle est due à l'État)
  const profit = Number(((unitPrice - costPrice) * quantity).toFixed(2));

  return NextResponse.json(
    {
      invoice,
      revenue: subtotal,
      advanceReceived: advance,
      remaining,
      profit,
      remainingStock: product.trackStock ? product.stockQty - quantity : null,
    },
    { status: 201 }
  );
}
