import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusLabel: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyée",
  PAID: "Payée",
  PARTIALLY_PAID: "Partiellement payée",
  OVERDUE: "En retard",
  CANCELED: "Annulée",
};

function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const merchantId = (session as any).merchantId;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const invoices = await prisma.invoice.findMany({
    where: {
      merchantId,
      ...(status && status !== "all" ? { status: status as any } : {}),
    },
    include: { client: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "Date",
    "Numéro",
    "Client",
    "Téléphone",
    "Produit(s)",
    "Statut",
    "Total (F)",
    "Avance reçue (F)",
    "Reste à percevoir (F)",
  ];

  const rows = invoices.map((inv) => {
    const total = Number(inv.total);
    const advance = Number(inv.advanceReceived);
    const remaining = Math.max(0, total - advance);
    return [
      new Date(inv.issueDate).toLocaleDateString("fr-FR"),
      inv.number,
      inv.client.name,
      inv.client.phone || "",
      inv.items.map((it) => it.description).join(" + "),
      statusLabel[inv.status] || inv.status,
      total,
      advance,
      remaining,
    ];
  });

  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\r\n");

  // BOM pour qu'Excel detecte l'UTF-8 et affiche correctement les accents
  const csvWithBom = "﻿" + csv;

  const dateStr = new Date().toISOString().split("T")[0];

  return new NextResponse(csvWithBom, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="factures-${dateStr}.csv"`,
    },
  });
}
