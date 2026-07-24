import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

function normalizeString(str: string): string {
  let val = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  if (val.length > 2 && (val.endsWith("s") || val.endsWith("x"))) {
    val = val.slice(0, -1);
  }
  return val;
}

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  const merchantId = (session as any).merchantId;

  const [
    invoiceCount,
    clientCount,
    allProducts,
    allInvoicesForMetrics,
    recentInvoices,
  ] = await Promise.all([
    prisma.invoice.count({ where: { merchantId } }),
    prisma.client.count({ where: { merchantId } }),
    prisma.product.findMany({
      where: { merchantId },
    }),
    prisma.invoice.findMany({
      where: { merchantId, type: "INVOICE", status: { not: "CANCELED" } },
      include: { items: true },
    }),
    prisma.invoice.findMany({
      where: { merchantId },
      include: { client: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Filter low-stock products in JS (stockQty <= lowStockAlert)
  const lowStockProducts = allProducts.filter((p) => p.trackStock && p.stockQty <= p.lowStockAlert);
  const lowStockCount = lowStockProducts.length;

  let totalInvoiced = 0;
  let totalPaid = 0;
  let totalCost = 0;

  for (const inv of allInvoicesForMetrics) {
    totalInvoiced += Number(inv.total);
    totalPaid += Number(inv.advanceReceived);
    for (const item of inv.items) {
      const qty = Number(item.quantity);
      
      // Fallback: if item cost price is 0, lookup product in catalog accent-insensitively
      let costPrice = Number(item.costPrice);
      if (costPrice === 0) {
        const matchedProduct = allProducts.find(
          (p) => normalizeString(p.name) === normalizeString(item.description)
        );
        if (matchedProduct) {
          costPrice = Number(matchedProduct.costPrice);
        }
      }
      totalCost += qty * costPrice;
    }
  }

  const totalRemaining = Math.max(0, totalInvoiced - totalPaid);
  const totalProfit = totalInvoiced - totalCost;
  const profitMarginPercent = totalInvoiced > 0 ? (totalProfit / totalInvoiced) * 100 : 0;

  const stats = [
    { label: "Factures & devis", value: invoiceCount, link: "/dashboard/invoices" },
    { label: "Clients enregistrés", value: clientCount, link: "/dashboard/clients" },
    { label: "Produits en stock bas", value: lowStockCount, link: "/dashboard/products" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Vue d'ensemble</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Suivi de l'activité et état de la trésorerie de votre boutique.
        </p>
      </div>

      {/* Financial Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-brand"></div>
          <span className="text-sm font-semibold text-neutral-500">Chiffre d'affaires facturé</span>
          <span className="text-2xl font-bold text-ink mt-3">
            {totalInvoiced.toLocaleString("fr-FR")} F
          </span>
          <span className="text-xs text-neutral-400 mt-2">
            Total des factures actives
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-neutral-400"></div>
          <span className="text-sm font-semibold text-neutral-500">Coût d'achat total</span>
          <span className="text-2xl font-bold text-neutral-700 mt-3">
            {totalCost.toLocaleString("fr-FR")} F
          </span>
          <span className="text-xs text-neutral-400 mt-2">
            Coût d'achat des produits vendus
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
          <span className="text-sm font-semibold text-neutral-500">Bénéfice net estimé</span>
          <span className={`text-2xl font-bold mt-3 ${totalProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {totalProfit.toLocaleString("fr-FR")} F
          </span>
          <span className="text-xs text-neutral-400 mt-2">
            Marge bénéficiaire : {profitMarginPercent.toFixed(1)}%
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-amber"></div>
          <span className="text-sm font-semibold text-neutral-500">Reste à recouvrer</span>
          <span className="text-2xl font-bold text-amber mt-3">
            {totalRemaining.toLocaleString("fr-FR")} F
          </span>
          <span className="text-xs text-neutral-400 mt-2">
            Solde restant dû par vos clients
          </span>
        </div>
      </div>

      {/* Business Activity Counts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.link}
            className="bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 p-4 transition-colors flex justify-between items-center"
          >
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-bold text-ink mt-1">{s.value}</p>
            </div>
            <span className="text-xs font-medium text-brand hover:underline">Gérer &rarr;</span>
          </Link>
        ))}
      </div>

      {/* Main Grid: Recent Invoices & Stock alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Recent Invoices */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
            <h2 className="text-lg font-bold text-ink">Derniers documents</h2>
            <Link href="/dashboard/invoices" className="text-xs font-semibold text-brand hover:underline">
              Voir tout
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">Aucune facture enregistrée.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-neutral-400 text-xs uppercase tracking-wider font-semibold border-b border-neutral-100">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Numéro</th>
                    <th className="pb-2">Client</th>
                    <th className="pb-2 text-right">Montant</th>
                    <th className="pb-2 text-center">Statut</th>
                    <th className="pb-2 text-right">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {recentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-2.5 text-neutral-500">
                        {new Date(inv.issueDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-2.5 font-medium text-ink">{inv.number}</td>
                      <td className="py-2.5 text-neutral-700">{inv.client.name}</td>
                      <td className="py-2.5 text-right font-medium text-ink">
                        {Number(inv.total).toLocaleString("fr-FR")} F
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${statusColors[inv.status]}`}>
                          {statusLabel[inv.status]}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <a
                          href={`/api/invoices/${inv.id}/pdf`}
                          target="_blank"
                          className="text-brand hover:underline font-semibold text-xs"
                        >
                          Voir
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Stock Alerts */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-ink">Alertes de stock</h2>
              <Link href="/dashboard/products" className="text-xs font-semibold text-brand hover:underline">
                Inventaire
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <span className="text-2xl">👍</span>
                <p className="text-sm font-semibold text-neutral-700">Stock optimal</p>
                <p className="text-xs text-neutral-400">Tous les produits ont un niveau de stock suffisant.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {lowStockProducts.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-2 rounded-lg bg-rose-50/50 border border-rose-100">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-rose-950">{p.name}</p>
                      <p className="text-xs text-rose-800/70">Alerte sous : {p.lowStockAlert} unités</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                      {p.stockQty} Restant{p.stockQty > 1 && "s"}
                    </span>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-xs text-neutral-400 text-center italic mt-2">
                    Et {lowStockProducts.length - 5} autres produits en alerte...
                  </p>
                )}
              </div>
            )}
          </div>

          {lowStockProducts.length > 0 && (
            <div className="pt-4 border-t border-neutral-100 text-xs text-rose-800 font-semibold bg-rose-50/20 p-2 rounded-lg text-center">
              ⚠️ Attention : Certains produits nécessitent un réapprovisionnement.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
