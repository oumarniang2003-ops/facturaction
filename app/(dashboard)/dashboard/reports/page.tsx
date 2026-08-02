import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DateSelector } from "./DateSelector";
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
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Eye, Download } from "lucide-react";

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

const statusLabel: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyée",
  PAID: "Payée",
  PARTIALLY_PAID: "Partiel",
  OVERDUE: "En retard",
  CANCELED: "Annulée",
};

const statusBadgeStyles: Record<string, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: "bg-neutral-100/60", text: "text-neutral-600", border: "border-neutral-200" },
  SENT: { bg: "bg-blue-50/70", text: "text-blue-700", border: "border-blue-100" },
  PAID: { bg: "bg-emerald-50/70", text: "text-emerald-700", border: "border-emerald-100" },
  PARTIALLY_PAID: { bg: "bg-sky-50/70", text: "text-sky-700", border: "border-sky-100" },
  OVERDUE: { bg: "bg-rose-50/70", text: "text-rose-700", border: "border-rose-100" },
  CANCELED: { bg: "bg-neutral-50/40", text: "text-neutral-400", border: "border-neutral-100" },
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

  // Fetch catalog products to fallback for matching costPrice
  const merchantProducts = await prisma.product.findMany({ where: { merchantId } });

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
      
      // Fallback: if item cost price is 0, lookup product in catalog accent-insensitively
      let costPrice = Number(item.costPrice);
      if (costPrice === 0) {
        const matchedProduct = merchantProducts.find(
          (p) => normalizeString(p.name) === normalizeString(name)
        );
        if (matchedProduct) {
          costPrice = Number(matchedProduct.costPrice);
        }
      }

      const itemCost = qty * costPrice;
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
          <h1 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
            <BarChart3 className="size-6 text-brand" /> Rapports Journaliers
          </h1>
          <p className="text-neutral-500 text-sm mt-1 capitalize font-medium">
            {formattedDate}
          </p>
        </div>
        <DateSelector initialDate={selectedDate} />
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden shadow-sm border-neutral-200 bg-white">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-brand"></div>
          <CardHeader className="pb-2 pt-5 px-6">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Chiffre d'affaires (CA)</span>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="text-2xl font-bold text-ink">
              {totalRevenue.toLocaleString("fr-FR")} F
            </div>
            <div className="text-xs text-neutral-400 mt-2">
              {invoices.length} facture{invoices.length > 1 ? "s" : ""} émise{invoices.length > 1 ? "s" : ""}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden shadow-sm border-neutral-200 bg-white">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-neutral-400"></div>
          <CardHeader className="pb-2 pt-5 px-6">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Coût d'achat marchandises</span>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="text-2xl font-bold text-neutral-700">
              {totalCost.toLocaleString("fr-FR")} F
            </div>
            <div className="text-xs text-neutral-400 mt-2">
              Valeur d'achat des produits vendus
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden shadow-sm border-neutral-200 bg-white">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
          <CardHeader className="pb-2 pt-5 px-6">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Bénéfice net</span>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {totalProfit.toLocaleString("fr-FR")} F
            </div>
            <div className="text-xs text-neutral-400 mt-2 flex items-center gap-1 font-medium text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 w-fit">
              <TrendingUp className="size-3" />
              <span>Marge : {profitMarginPercent.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden shadow-sm border-neutral-200 bg-white">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-500"></div>
          <CardHeader className="pb-2 pt-5 px-6">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Panier moyen</span>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="text-2xl font-bold text-sky-600">
              {averageBasket.toLocaleString("fr-FR")} F
            </div>
            <div className="text-xs text-neutral-400 mt-2">
              Valeur moyenne par facture
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Products sold details */}
        <Card className="lg:col-span-2 bg-white border-neutral-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 pt-5 px-6 border-b border-neutral-100">
              <CardTitle className="text-base font-bold text-ink">Détail des marchandises vendues</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {soldProducts.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-12">Aucun produit vendu pour cette journée.</p>
              ) : (
                <Table>
                  <TableHeader className="bg-neutral-50/60">
                    <TableRow>
                      <TableHead className="px-6 py-3 font-semibold text-[11px] text-neutral-500 uppercase tracking-wider h-10">Désignation</TableHead>
                      <TableHead className="px-6 py-3 font-semibold text-[11px] text-neutral-500 uppercase tracking-wider h-10 text-center">Quantité</TableHead>
                      <TableHead className="px-6 py-3 font-semibold text-[11px] text-neutral-500 uppercase tracking-wider h-10 text-right">CA Généré</TableHead>
                      <TableHead className="px-6 py-3 font-semibold text-[11px] text-neutral-500 uppercase tracking-wider h-10 text-right">Coût Achat</TableHead>
                      <TableHead className="px-6 py-3 font-semibold text-[11px] text-neutral-500 uppercase tracking-wider h-10 text-right">Bénéfice</TableHead>
                      <TableHead className="px-6 py-3 font-semibold text-[11px] text-neutral-500 uppercase tracking-wider h-10 text-right">Marge</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-neutral-100">
                    {soldProducts.map((p) => (
                      <TableRow key={p.name} className="hover:bg-neutral-50/40 transition-colors">
                        <TableCell className="px-6 py-3 font-semibold text-ink text-xs">{p.name}</TableCell>
                        <TableCell className="px-6 py-3 text-center font-bold text-neutral-700 text-xs">{p.quantity}</TableCell>
                        <TableCell className="px-6 py-3 text-right font-medium text-xs">{p.revenue.toLocaleString("fr-FR")} F</TableCell>
                        <TableCell className="px-6 py-3 text-right text-neutral-500 text-xs">{p.cost.toLocaleString("fr-FR")} F</TableCell>
                        <TableCell className={`px-6 py-3 text-right font-bold text-xs ${p.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {p.profit.toLocaleString("fr-FR")} F
                        </TableCell>
                        <TableCell className="px-6 py-3 text-right text-neutral-400 font-medium text-xs">
                          {p.marginPercent.toFixed(0)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </div>
        </Card>

        {/* Right column: Invoices list for the day */}
        <Card className="bg-white border-neutral-200 shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <CardHeader className="pb-3 pt-5 px-6 border-b border-neutral-100">
              <CardTitle className="text-base font-bold text-ink">Factures de la journée</CardTitle>
            </CardHeader>

            <CardContent className="p-4">
              {invoices.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-12">Aucune facture émise ce jour.</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {invoices.map((inv) => {
                    const colorSet = statusBadgeStyles[inv.status] || statusBadgeStyles.DRAFT;
                    return (
                      <Card key={inv.id} className="border border-neutral-200/80 bg-white hover:border-brand transition-colors rounded-xl overflow-hidden shadow-xs">
                        <CardContent className="p-3.5 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-ink">{inv.number}</span>
                            <Badge 
                              variant="outline" 
                              className={`rounded-full px-2 py-0.5 text-[9px] font-semibold border ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
                            >
                              {statusLabel[inv.status]}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-neutral-500 font-medium">{inv.client.name}</span>
                            <span className="font-bold text-ink">{Number(inv.total).toLocaleString("fr-FR")} F</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-neutral-100 text-[10px] text-neutral-400">
                            <span>Avance: {Number(inv.advanceReceived).toLocaleString("fr-FR")} F</span>
                            <Link href={`/dashboard/invoices/${inv.id}/edit`}>
                              <Button variant="link" className="text-brand p-0 h-auto text-[10px] font-bold flex items-center gap-0.5">
                                <span>Détails</span>
                                <Eye className="size-3" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
