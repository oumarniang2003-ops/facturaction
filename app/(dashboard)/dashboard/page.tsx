import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  const merchantId = (session as any).merchantId;

  const [invoiceCount, clientCount, lowStockCount, revenue] = await Promise.all([
    prisma.invoice.count({ where: { merchantId } }),
    prisma.client.count({ where: { merchantId } }),
    prisma.product.count({ where: { merchantId, trackStock: true, stockQty: { lte: 5 } } }),
    prisma.invoice.aggregate({
      where: { merchantId, status: "PAID" },
      _sum: { total: true },
    }),
  ]);

  const stats = [
    { label: "Chiffre d'affaires encaissé", value: `${revenue._sum.total ?? 0} €` },
    { label: "Factures & devis", value: invoiceCount },
    { label: "Clients", value: clientCount },
    { label: "Produits en stock bas", value: lowStockCount },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Vue d'ensemble</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-neutral-200 p-5">
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className="text-2xl font-semibold text-ink mt-1">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
