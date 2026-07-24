import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DateSelector } from "./DateSelector";
import Link from "next/link";

const statusLabel: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyée",
  PAID: "Payée",
  PARTIALLY_PAID: "Partiel",
  OVERDUE: "En retard",
  CANCELED: "Annulée",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-neutral-100 text-neutral-800 border-neutral-200",
  SENT: "bg-blue-50 text-blue-700 border-blue-100",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-100",
  PARTIALLY_PAID: "bg-sky-50 text-sky-700 border-sky-100",
  OVERDUE: "bg-rose-50 text-rose-700 border-rose-100",
  CANCELED: "bg-neutral-50 text-neutral-400 border-neutral-100",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const merchantId = (session as any).merchantId;

  // Default to today's date if none selected
  const selectedDate = searchParams.date || new Date().toISOString().split("T")[0];

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch invoices of the day (only invoices, excluding quotes and canceled)
  const invoices = await prisma.invoice.findMany({
    where: {
      merchantId,
      type: "INVOICE",
      status: { not: "CANCELED" },
      issueDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      items: true,
      client: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate totals and compile product sales metrics
  let totalRevenue = 0;
  let totalCost = 0;
  const salesMap: Record<string, { quantity: number; revenue: number; cost: number; profit: number }> = {};

  for (const inv of invoices) {
    totalRevenue += Number(inv.total);
    for (const item of inv.items) {
      const name = item.description;
      const qty = Number(item.quantity);
      const itemRev = qty * Number(item.unitPrice);
      const itemCost = qty * Number(item.costPrice);
      const itemProfit = itemRev - itemCost;

      totalCost += itemCost;

      if (!salesMap[name]) {
        salesMap[name] = { quantity: 0, revenue: 0, cost: 0, profit: 0 };
      }
      salesMap[name].quantity += qty;
      salesMap[name].revenue += itemRev;
      salesMap[name].cost += itemCost;
      salesMap[name].profit += itemProfit;
    }
  }

  const totalProfit = totalRevenue - totalCost;
  const averageBasket = invoices.length > 0 ? totalRevenue / invoices.length : 0;
  const profitMarginPercent = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const soldProducts = Object.entries(salesMap)
    .map(([name, stats]) => ({
      name,
      ...stats,
      marginPercent: stats.revenue > 0 ? (stats.profit / stats.revenue) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const formattedDate = new Date(selectedDate).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Header with Date Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="font-display text-3xl text-ink">Rapports Journaliers</h1>
          <p className="text-neutral-500 text-sm mt-1 capitalize">
            {formattedDate}
          </p>
        </div>
        <DateSelector initialDate={selectedDate} />
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-brand"></div>
          <span className="text-sm font-semibold text-neutral-500">Chiffre d'affaires (CA)</span>
          <span className="text-2xl font-bold text-ink mt-3">
            {totalRevenue.toLocaleString("fr-FR")} F
          </span>
          <span className="text-xs text-neutral-400 mt-2">
            {invoices.length} facture{invoices.length > 1 ? "s" : ""} émise{invoices.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-neutral-400"></div>
          <span className="text-sm font-semibold text-neutral-500">Coût d'achat marchandises</span>
          <span className="text-2xl font-bold text-neutral-700 mt-3">
            {totalCost.toLocaleString("fr-FR")} F
          </span>
          <span className="text-xs text-neutral-400 mt-2">
            Valeur d'achat des produits vendus
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
          <span className="text-sm font-semibold text-neutral-500">Bénéfice net</span>
          <span className={`text-2xl font-bold mt-3 ${totalProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {totalProfit.toLocaleString("fr-FR")} F
          </span>
          <span className="text-xs text-neutral-400 mt-2">
            Marge bénéficiaire nette : {profitMarginPercent.toFixed(1)}%
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-sky-500"></div>
          <span className="text-sm font-semibold text-neutral-500">Panier moyen</span>
          <span className="text-2xl font-bold text-sky-600 mt-3">
            {averageBasket.toLocaleString("fr-FR")} F
          </span>
          <span className="text-xs text-neutral-400 mt-2">
            Valeur moyenne par facture
          </span>
        </div>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Products sold details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-ink pb-2 border-b border-neutral-100">
            Détail des marchandises vendues
          </h2>

          {soldProducts.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">Aucun produit vendu pour cette journée.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-neutral-400 text-xs uppercase tracking-wider font-semibold border-b border-neutral-100">
                    <th className="pb-2">Désignation</th>
                    <th className="pb-2 text-center">Quantité</th>
                    <th className="pb-2 text-right">CA Généré</th>
                    <th className="pb-2 text-right">Coût Achat</th>
                    <th className="pb-2 text-right">Bénéfice</th>
                    <th className="pb-2 text-right">Marge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {soldProducts.map((p) => (
                    <tr key={p.name} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3 font-medium text-ink">{p.name}</td>
                      <td className="py-3 text-center font-semibold text-neutral-700">{p.quantity}</td>
                      <td className="py-3 text-right font-medium">{p.revenue.toLocaleString("fr-FR")} F</td>
                      <td className="py-3 text-right text-neutral-500">{p.cost.toLocaleString("fr-FR")} F</td>
                      <td className={`py-3 text-right font-semibold ${p.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {p.profit.toLocaleString("fr-FR")} F
                      </td>
                      <td className="py-3 text-right text-neutral-400 text-xs">
                        {p.marginPercent.toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column: Invoices list for the day */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-ink pb-2 border-b border-neutral-100">
            Factures de la journée
          </h2>

          {invoices.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">Aucune facture émise ce jour.</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-3 rounded-xl border border-neutral-200 flex flex-col gap-2 hover:border-brand transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-ink">{inv.number}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusColors[inv.status]}`}>
                      {statusLabel[inv.status]}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500 font-medium">{inv.client.name}</span>
                    <span className="font-bold text-ink">{Number(inv.total).toLocaleString("fr-FR")} F</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-neutral-100 text-[10px] text-neutral-400">
                    <span>Acompte: {Number(inv.advanceReceived).toLocaleString("fr-FR")} F</span>
                    <Link
                      href={`/dashboard/invoices/${inv.id}/edit`}
                      className="text-brand hover:underline font-semibold"
                    >
                      Détails &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
