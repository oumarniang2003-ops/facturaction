import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { merchantId: (session as any).merchantId },
    orderBy: { createdAt: "desc" },
    include: { invoices: { where: { status: { not: "CANCELED" } }, select: { total: true } } },
  });

  const result = clients.map(({ invoices, ...c }) => ({
    ...c,
    invoiceCount: invoices.length,
    totalInvoiced: invoices.reduce((sum, inv) => sum + Number(inv.total), 0),
  }));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const client = await prisma.client.create({
    data: { ...body, merchantId: (session as any).merchantId },
  });
  return NextResponse.json(client, { status: 201 });
}
