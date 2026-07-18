import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { merchantId: (session as any).merchantId },
    orderBy: { createdAt: "desc" },
  });

  // Signale les produits en stock bas côté API pour affichage direct
  const withAlerts = products.map((p) => ({
    ...p,
    lowStock: p.trackStock && p.stockQty <= p.lowStockAlert,
  }));

  return NextResponse.json(withAlerts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const product = await prisma.product.create({
    data: { ...body, merchantId: (session as any).merchantId },
  });
  return NextResponse.json(product, { status: 201 });
}
