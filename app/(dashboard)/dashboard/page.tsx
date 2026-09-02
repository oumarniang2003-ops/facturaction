import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MonthSelector } from "./MonthSelector";
import { RevenueTrendChart } from "./RevenueTrendChart";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Package,
  FileText,
  Users,
  ArrowUpRight,
  DollarSign,
  Receipt,
  ArrowRight
} from "lucide-react";

const statusLabel: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyée",
  PAID: "Payée",
  PARTIALLY_PAID: "Partiel",
  OVERDUE: "En retard",
  CANCELED: "Annulée",
};

const statusBadgeStyles: Record<string, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: "bg-neutral-100", text: "text-neutral-600", border: "border-neutral-200" },
  SENT: { bg: "bg-brand/10", text: "text-brand", border: "border-brand/20" },
  PAID: { bg: "bg-mint/10", text: "text-mint", border: "border-mint/20" },
  PARTIALLY_PAID: { bg: "bg-gold/10", text: "text-gold", border: "border-gold/20" },
  OVERDUE: { bg: "bg-amber/10", text: "text-amber", border: "border-amber/20" },
  CANCELED: { bg: "bg-neutral-50", text: "text-neutral-400", border: "border-neutral-100" },
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

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const session = await getServerSession(authOptions);
  const merchantId = (session as any).merchantId;

  // Default to the current month if none selected (format attendu : YYYY-MM)
  const now = new Date();
  const selectedMonth =
    searchParams.month && /^\d{4}-\d{2}$/.test(searchParams.month)
      ? searchParams.month
      : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [year, month] = selectedMonth.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  // Fenêtre glissante des 12 derniers mois (indépendante du mois sélectionné) pour le graphique de tendance
  const trendStart = new Date(now.getFullYear(), now.getMonth() - 11, 1, 0, 0, 0, 0);
  const trendEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [
    invoiceCount,
    clientCount,
    allProducts,
    allInvoicesForMetrics,
    recentInvoices,
    trendInvoices,
  ] = await Promise.all([
    prisma.invoice.count({ where: { merchantId } }),
    prisma.client.count({ where: { merchantId } }),
    prisma.product.findMany({
      where: { merchantId },
    }),
    prisma.invoice.findMany({
      where: {
        merchantId,
        type: "INVOICE",
        status: { not: "CANCELED" },
        issueDate: { gte: startOfMonth, lte: endOfMonth },
      },
      include: { items: true },
    }),
    prisma.invoice.findMany({
      where: { merchantId },
      include: { client: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: {
        merchantId,
        type: "INVOICE",
        status: { not: "CANCELED" },
        issueDate: { gte: trendStart, lte: trendEnd },
      },
      include: { items: true },
    }),
  ]);

  const formattedMonth = startOfMonth.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const lowStockProducts = allProducts.filter((p) => p.trackStock && p.stockQty <= p.lowStockAlert);
  const lowStockCount = lowStockProducts.length;

  function resolveCostPrice(itemCostPrice: number, description: string) {
    if (itemCostPrice !== 0) return itemCostPrice;
    const matchedProduct = allProducts.find(
      (p) => normalizeString(p.name) === normalizeString(description)
    );
    return matchedProduct ? Number(matchedProduct.costPrice) : 0;
  }

  let totalInvoiced = 0;
  let totalPaid = 0;
  let totalCost = 0;

  for (const inv of allInvoicesForMetrics) {
    totalInvoiced += Number(inv.total);
    totalPaid += Number(inv.advanceReceived);
    for (const item of inv.items) {
      const qty = Number(item.quantity);
      const costPrice = resolveCostPrice(Number(item.costPrice), item.description);
      totalCost += qty * costPrice;
    }
  }

  // Regroupement des 12 derniers mois pour le graphique de tendance
  const trendBuckets: { key: string; label: string; revenue: number; profit: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    trendBuckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      revenue: 0,
      profit: 0,
    });
  }
  const trendByKey = new Map(trendBuckets.map((b) => [b.key, b]));

  for (const inv of trendInvoices) {
    const d = new Date(inv.issueDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = trendByKey.get(key);
    if (!bucket) continue;

    const revenue = Number(inv.total);
    let cost = 0;
    for (const item of inv.items) {
      cost += Number(item.quantity) * resolveCostPrice(Number(item.costPrice), item.description);
    }
    bucket.revenue += revenue;
    bucket.profit += revenue - cost;
  }

  const trendData = trendBuckets.map((b) => ({
    month: b.label,
    revenue: b.revenue,
    profit: b.profit,
  }));

  const totalRemaining = Math.max(0, totalInvoiced - totalPaid);
  const totalProfit = totalInvoiced - totalCost;
  const profitMarginPercent = totalInvoiced > 0 ? (totalProfit / totalInvoiced) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Vue d'ensemble</h1>
          <p className="text-neutral-500 text-sm mt-1 capitalize">
            Chiffres de <span className="font-semibold">{formattedMonth}</span>, état du stock et des clients au global.
          </p>
        </div>
        <MonthSelector initialMonth={selectedMonth} />
      </div>

      {/* Financial Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chiffre d'affaires */}
        <Card className="relative overflow-hidden shadow-[0_8px_30px_rgb(91,79,232,0.06)] border-neutral-200/60 bg-white rounded-3xl">
          <CardHeader className="pb-2 pt-6 px-6 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Chiffre d'affaires</span>
            <div className="w-9 h-9 rounded-full bg-mint/10 flex items-center justify-center shrink-0">
              <DollarSign className="size-4.5 text-mint" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-2xl font-display font-extrabold text-ink">
              {totalInvoiced.toLocaleString("fr-FR")} F
            </div>
            <div className="text-xs text-neutral-400 mt-2 font-semibold capitalize">
              Factures de {formattedMonth}
            </div>
          </CardContent>
        </Card>

        {/* Coût d'achat total */}
        <Card className="relative overflow-hidden shadow-[0_8px_30px_rgb(91,79,232,0.06)] border-neutral-200/60 bg-white rounded-3xl">
          <CardHeader className="pb-2 pt-6 px-6 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Coûts d'achat</span>
            <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
              <Package className="size-4.5 text-brand" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-2xl font-display font-extrabold text-neutral-700">
              {totalCost.toLocaleString("fr-FR")} F
            </div>
            <div className="text-xs text-neutral-400 mt-2 font-semibold">
              Achat des produits vendus
            </div>
          </CardContent>
        </Card>

        {/* Bénéfice net estimé */}
        <Card className="relative overflow-hidden shadow-[0_8px_30px_rgb(91,79,232,0.12)] border-neutral-200/40 bg-white rounded-3xl ring-2 ring-brand/10">
          <CardHeader className="pb-2 pt-6 px-6 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Bénéfice net</span>
            <div className="w-9 h-9 rounded-full bg-mint/10 flex items-center justify-center shrink-0">
              <TrendingUp className="size-4.5 text-mint" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className={`text-2xl font-display font-extrabold ${totalProfit >= 0 ? "text-mint" : "text-amber"}`}>
              {totalProfit.toLocaleString("fr-FR")} F
            </div>
            <div className="text-xs mt-2 flex items-center gap-1 font-extrabold text-mint bg-mint/5 px-2 py-0.5 rounded-full w-fit">
              <span>Marge : {profitMarginPercent.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Reste à recouvrer */}
        <Card className="relative overflow-hidden shadow-[0_8px_30px_rgb(91,79,232,0.06)] border-neutral-200/60 bg-white rounded-3xl">
          <CardHeader className="pb-2 pt-6 px-6 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Reste à percevoir</span>
            <div className="w-9 h-9 rounded-full bg-amber/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-4.5 text-amber" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-2xl font-display font-extrabold text-amber">
              {totalRemaining.toLocaleString("fr-FR")} F
            </div>
            <div className="text-xs text-neutral-400 mt-2 font-semibold">
              Solde restant dû par vos clients
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card className="bg-white border-neutral-200/60 shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="pb-2 pt-5 px-6 border-b border-neutral-100">
          <CardTitle className="text-base font-bold text-ink font-display">Évolution sur 12 mois</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-4">
          <RevenueTrendChart data={trendData} />
        </CardContent>
      </Card>

      {/* Business Activity Counts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Invoices link */}
        <Link href="/dashboard/invoices" className="group">
          <Card className="hover:bg-white/80 border-neutral-200/60 transition-all duration-200 cursor-pointer shadow-sm rounded-3xl">
            <CardContent className="p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <FileText className="size-5 text-brand" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Factures & devis</p>
                  <p className="text-xl font-display font-extrabold text-ink mt-0.5">{invoiceCount}</p>
                </div>
              </div>
              <span className="w-8 h-8 rounded-full bg-neutral-50 group-hover:bg-brand group-hover:text-white flex items-center justify-center text-neutral-400 transition-colors shadow-inner">
                <ArrowRight className="size-4" />
              </span>
            </CardContent>
          </Card>
        </Link>

        {/* Clients link */}
        <Link href="/dashboard/clients" className="group">
          <Card className="hover:bg-white/80 border-neutral-200/60 transition-all duration-200 cursor-pointer shadow-sm rounded-3xl">
            <CardContent className="p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Users className="size-5 text-gold" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Clients enregistrés</p>
                  <p className="text-xl font-display font-extrabold text-ink mt-0.5">{clientCount}</p>
                </div>
              </div>
              <span className="w-8 h-8 rounded-full bg-neutral-50 group-hover:bg-brand group-hover:text-white flex items-center justify-center text-neutral-400 transition-colors shadow-inner">
                <ArrowRight className="size-4" />
              </span>
            </CardContent>
          </Card>
        </Link>

        {/* Stock alerts link */}
        <Link href="/dashboard/products" className="group">
          <Card className="hover:bg-white/80 border-neutral-200/60 transition-all duration-200 cursor-pointer shadow-sm rounded-3xl">
            <CardContent className="p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${lowStockCount > 0 ? "bg-amber/10 text-amber animate-pulse" : "bg-mint/10 text-mint"}`}>
                  <Package className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Stock critique</p>
                  <p className="text-xl font-display font-extrabold text-ink mt-0.5">{lowStockCount}</p>
                </div>
              </div>
              <span className="w-8 h-8 rounded-full bg-neutral-50 group-hover:bg-brand group-hover:text-white flex items-center justify-center text-neutral-400 transition-colors shadow-inner">
                <ArrowRight className="size-4" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Grid: Recent Invoices & Stock alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Recent Invoices */}
        <Card className="lg:col-span-2 bg-white border-neutral-200/60 shadow-sm overflow-hidden flex flex-col justify-between rounded-3xl">
          <div>
            <CardHeader className="flex flex-row justify-between items-center pb-4 border-b border-neutral-100 px-6 pt-5">
              <CardTitle className="text-base font-bold text-ink font-display">Derniers documents</CardTitle>
              <Link href="/dashboard/invoices">
                <Button variant="outline" className="text-xs font-bold rounded-full h-8 px-4 border-neutral-200 hover:bg-neutral-50">
                  Voir tout
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {recentInvoices.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-10 font-semibold">Aucune facture enregistrée.</p>
              ) : (
                <Table>
                  <TableHeader className="bg-neutral-50/50">
                    <TableRow className="border-b border-neutral-100 hover:bg-transparent">
                      <TableHead className="px-6 py-3 font-bold text-[10px] text-neutral-400 uppercase tracking-wider h-10">Date</TableHead>
                      <TableHead className="px-6 py-3 font-bold text-[10px] text-neutral-400 uppercase tracking-wider h-10">Numéro</TableHead>
                      <TableHead className="px-6 py-3 font-bold text-[10px] text-neutral-400 uppercase tracking-wider h-10">Client</TableHead>
                      <TableHead className="px-6 py-3 font-bold text-[10px] text-neutral-400 uppercase tracking-wider h-10 text-right">Montant</TableHead>
                      <TableHead className="px-6 py-3 font-bold text-[10px] text-neutral-400 uppercase tracking-wider h-10 text-center">Statut</TableHead>
                      <TableHead className="px-6 py-3 font-bold text-[10px] text-neutral-400 uppercase tracking-wider h-10 text-right">PDF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-neutral-100/60">
                    {recentInvoices.map((inv) => {
                      const colorSet = statusBadgeStyles[inv.status] || statusBadgeStyles.DRAFT;
                      return (
                        <TableRow key={inv.id} className="hover:bg-neutral-50/20 border-b border-neutral-100/40 transition-colors">
                          <TableCell className="px-6 py-3.5 text-neutral-500 text-xs font-medium">
                            {new Date(inv.issueDate).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell className="px-6 py-3.5 font-bold text-ink text-xs">{inv.number}</TableCell>
                          <TableCell className="px-6 py-3.5 text-neutral-600 text-xs font-semibold">{inv.client.name}</TableCell>
                          <TableCell className="px-6 py-3.5 text-right font-bold text-ink text-xs">
                            {Number(inv.total).toLocaleString("fr-FR")} F
                          </TableCell>
                          <TableCell className="px-6 py-3.5 text-center">
                            <Badge 
                              variant="outline" 
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
                            >
                              {statusLabel[inv.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-3.5 text-right">
                            <a
                              href={`/api/invoices/${inv.id}/pdf`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button variant="link" className="text-brand p-0 h-auto text-xs font-bold hover:underline">
                                Voir
                              </Button>
                            </a>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </div>
        </Card>

        {/* Right Side: Stock Alerts */}
        <Card className="bg-white border-neutral-200/60 shadow-sm flex flex-col justify-between overflow-hidden rounded-3xl">
          <div>
            <CardHeader className="flex flex-row justify-between items-center pb-4 border-b border-neutral-100 px-6 pt-5">
              <CardTitle className="text-base font-bold text-ink font-display">Alertes de stock</CardTitle>
              <Link href="/dashboard/products">
                <Button variant="outline" className="text-xs font-bold rounded-full h-8 px-4 border-neutral-200 hover:bg-neutral-50">
                  Inventaire
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-6 pb-2">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8 space-y-2 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-mint/10 text-mint flex items-center justify-center border border-mint/20">
                    <CheckCircle className="size-6" />
                  </div>
                  <p className="text-sm font-bold text-ink mt-2">Stock optimal</p>
                  <p className="text-xs text-neutral-400 font-medium">Tous les produits ont un niveau de stock suffisant.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {lowStockProducts.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex justify-between items-center p-3 rounded-2xl bg-amber/5 border border-amber/10">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-neutral-800">{p.name}</p>
                        <p className="text-[10px] text-neutral-400 font-semibold">Alerte sous : {p.lowStockAlert} unités</p>
                      </div>
                      <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-white text-amber border-amber/20 shadow-sm">
                        {p.stockQty} Restant{p.stockQty > 1 && "s"}
                      </Badge>
                    </div>
                  ))}
                  {lowStockProducts.length > 5 && (
                    <p className="text-xs text-neutral-400 text-center italic mt-2 font-medium">
                      Et {lowStockProducts.length - 5} autres produits en alerte...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </div>

          {lowStockProducts.length > 0 && (
            <div className="mx-6 mb-6 p-3 rounded-2xl bg-amber/5 border border-amber/10 text-[11px] text-amber font-bold flex items-center gap-1.5 justify-center">
              <AlertTriangle className="size-3.5 text-amber shrink-0" />
              <span>Réapprovisionnement nécessaire</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
