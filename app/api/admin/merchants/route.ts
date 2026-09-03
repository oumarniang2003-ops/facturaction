import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const merchants = await prisma.merchant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: true,
      users: {
        select: { name: true, email: true, role: true, lastLoginAt: true },
      },
      _count: { select: { invoices: true, clients: true } },
    },
  });

  const result = merchants.map((m) => {
    const owner = m.users.find((u) => u.role === "OWNER") ?? m.users[0] ?? null;
    const lastLoginAt = m.users.reduce<Date | null>((latest, u) => {
      if (!u.lastLoginAt) return latest;
      if (!latest || u.lastLoginAt > latest) return u.lastLoginAt;
      return latest;
    }, null);

    return {
      id: m.id,
      businessName: m.businessName,
      slug: m.slug,
      email: m.email,
      createdAt: m.createdAt,
      ownerName: owner?.name ?? null,
      ownerEmail: owner?.email ?? m.email,
      userCount: m.users.length,
      invoiceCount: m._count.invoices,
      clientCount: m._count.clients,
      lastLoginAt,
      plan: m.subscription?.plan ?? "STARTER",
      status: m.subscription?.status ?? "TRIALING",
      paidUntil: m.subscription?.paidUntil ?? null,
    };
  });

  return NextResponse.json(result);
}
