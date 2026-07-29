import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const merchantId = (session as any).merchantId;

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
  });

  if (!merchant) {
    return NextResponse.json({ error: "Commerçant introuvable" }, { status: 404 });
  }

  return NextResponse.json(merchant);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const role = (session as any).role;
  if (role !== "OWNER") {
    return NextResponse.json(
      { error: "Seul le propriétaire peut modifier les paramètres de l'entreprise" },
      { status: 403 }
    );
  }

  const merchantId = (session as any).merchantId;

  try {
    const body = await req.json();
    const { businessName, businessSubtitle, email, phone, address, vatNumber } = body;

    if (!businessName || !email) {
      return NextResponse.json(
        { error: "Le nom de l'entreprise et l'email de facturation sont obligatoires" },
        { status: 400 }
      );
    }

    // Vérifier si l'email est déjà pris par un autre commerçant
    const existing = await prisma.merchant.findFirst({
      where: {
        email,
        id: { not: merchantId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Cet email est déjà associé à un autre commerce" },
        { status: 400 }
      );
    }

    const updated = await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        businessName,
        businessSubtitle: businessSubtitle || null,
        email,
        phone: phone || null,
        address: address || null,
        vatNumber: vatNumber || null,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour" },
      { status: 500 }
    );
  }
}
