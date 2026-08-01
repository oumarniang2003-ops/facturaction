import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const role = (session as any).role;
  if (role !== "OWNER") {
    return NextResponse.json(
      { error: "Seul le propriétaire (OWNER) peut réinitialiser les données de la boutique." },
      { status: 403 }
    );
  }

  const merchantId = (session as any).merchantId;

  try {
    // Exécuter la réinitialisation dans une transaction Prisma
    await prisma.$transaction([
      // 1. Supprimer tous les paiements liés aux factures de ce commerçant
      prisma.payment.deleteMany({
        where: {
          invoice: { merchantId },
        },
      }),
      // 2. Supprimer toutes les lignes d'articles des factures de ce commerçant
      prisma.invoiceItem.deleteMany({
        where: {
          invoice: { merchantId },
        },
      }),
      // 3. Supprimer toutes les factures (factures et devis) de ce commerçant
      prisma.invoice.deleteMany({
        where: { merchantId },
      }),
      // 4. Supprimer tous les mouvements de stock des produits de ce commerçant
      prisma.stockMovement.deleteMany({
        where: {
          product: { merchantId },
        },
      }),
      // 5. Supprimer tous les produits de ce commerçant
      prisma.product.deleteMany({
        where: { merchantId },
      }),
      // 6. Supprimer tous les clients de ce commerçant
      prisma.client.deleteMany({
        where: { merchantId },
      }),
      // 7. Supprimer le compteur de facturation pour le réinitialiser
      prisma.invoiceCounter.deleteMany({
        where: { merchantId },
      }),
    ]);

    return NextResponse.json({ success: true, message: "La boutique a été réinitialisée avec succès." });
  } catch (err: any) {
    console.error("Erreur lors de la réinitialisation de la boutique :", err);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la réinitialisation des données." },
      { status: 500 }
    );
  }
}
