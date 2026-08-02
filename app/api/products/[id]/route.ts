import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const merchantId = (session as any).merchantId;
  const body = await req.json();

  const existing = await prisma.product.findFirst({
    where: { id: params.id, merchantId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
  }

  const updated = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: body.name,
      costPrice: body.costPrice,
      trackStock: body.trackStock,
      stockQty: body.stockQty,
      vatRate: body.vatRate ?? 0,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const merchantId = (session as any).merchantId;

  const existing = await prisma.product.findFirst({
    where: { id: params.id, merchantId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
  }

  await prisma.product.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
