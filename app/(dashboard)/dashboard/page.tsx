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
import { TrendingUp, AlertTriangle, CheckCircle, Package } from "lucide-react";

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
        <h1 className="font-display text-3xl font-bold text-ink">Vue d'ensemble</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Suivi de l'activité et état de la trésorerie de votre boutique.
        </p>
      </div>

      {/* Financial Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden shadow-sm border-neutral-200 bg-white">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-brand"></div>
          <CardHeader className="pb-2 pt-5 px-6">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Chiffre d'affaires</span>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="text-2xl font-bold text-ink">
              {totalInvoiced.toLocaleString("fr-FR")} F
            </div>
            <div className="text-xs text-neutral-400 mt-2">
              Total des factures actives
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden shadow-sm border-neutral-200 bg-white">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-neutral-400"></div>
          <CardHeader className="pb-2 pt-5 px-6">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Coût d'achat total</span>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="text-2xl font-bold text-neutral-700">
              {totalCost.toLocaleString("fr-FR")} F
            </div>
            <div className="text-xs text-neutral-400 mt-2">
              Achat des produits vendus
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden shadow-sm border-neutral-200 bg-white">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
          <CardHeader className="pb-2 pt-5 px-6">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Bénéfice net estimé</span>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {totalProfit.toLocaleString("fr-FR")} F
            </div>
            <div className="text-xs text-neutral-400 mt-2 flex items-center gap-1">
              <TrendingUp className="size-3 text-emerald-500" />
              <span>Marge : {profitMarginPercent.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden shadow-sm border-neutral-200 bg-white">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber"></div>
          <CardHeader className="pb-2 pt-5 px-6">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Reste à recouvrer</span>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="text-2xl font-bold text-amber">
              {totalRemaining.toLocaleString("fr-FR")} F
            </div>
            <div className="text-xs text-neutral-400 mt-2">
              Solde restant dû par vos clients
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Activity Counts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.link} className="group">
            <Card className="hover:bg-neutral-50/50 border-neutral-200 transition-all duration-200 cursor-pointer shadow-sm">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">{s.label}</p>
                  <p className="text-xl font-bold text-ink mt-1">{s.value}</p>
                </div>
                <span className="text-xs font-semibold text-brand group-hover:underline flex items-center gap-1">
                  Gérer &rarr;
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Grid: Recent Invoices & Stock alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Recent Invoices */}
        <Card className="lg:col-span-2 bg-white border-neutral-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row justify-between items-center pb-3 border-b border-neutral-100 px-6 pt-5">
              <CardTitle className="text-base font-bold text-ink">Derniers documents</CardTitle>
              <Link href="/dashboard/invoices">
                <Button variant="link" className="text-xs font-semibold text-brand p-0 h-auto">
                  Voir tout
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {recentInvoices.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-10">Aucune facture enregistrée.</p>
              ) : (
                <Table>
                  <TableHeader className="bg-neutral-50/60">
                    <TableRow>
                      <TableHead className="px-6 py-3 font-semibold text-[11px] text-neutral-500 uppercase tracking-wider h-10">Date</TableHead>
                      <TableHead className="px-6 py-3 font-semibold text-[11px] text-neutral-500 uppercase tracking-wider h-10">Numéro</TableHead>
                      <TableHead className="px-6 py-3 font-semibold text-[11px] text-neutral-500 uppercase tracking-wider h-10">Client</TableHead>
                      <TableHead className="px-6 py-3 font-semibold text-[11px] text-neutral-500 uppercase tracking-wider h-10 text-right">Montant</TableHead>
                      <TableHead className="px-6 py-3 font-semibold text-[11px] text-neutral-500 uppercase tracking-wider h-10 text-center">Statut</TableHead>
                      <TableHead className="px-6 py-3 font-semibold text-[11px] text-neutral-500 uppercase tracking-wider h-10 text-right">PDF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-neutral-100">
                    {recentInvoices.map((inv) => {
                      const colorSet = statusBadgeStyles[inv.status] || statusBadgeStyles.DRAFT;
                      return (
                        <TableRow key={inv.id} className="hover:bg-neutral-50/40 transition-colors">
                          <TableCell className="px-6 py-3 text-neutral-500 text-xs">
                            {new Date(inv.issueDate).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell className="px-6 py-3 font-medium text-ink text-xs">{inv.number}</TableCell>
                          <TableCell className="px-6 py-3 text-neutral-700 text-xs">{inv.client.name}</TableCell>
                          <TableCell className="px-6 py-3 text-right font-medium text-ink text-xs">
                            {Number(inv.total).toLocaleString("fr-FR")} F
                          </TableCell>
                          <TableCell className="px-6 py-3 text-center">
                            <Badge 
                              variant="outline" 
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
                            >
                              {statusLabel[inv.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-3 text-right">
                            <a
                              href={`/api/invoices/${inv.id}/pdf`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button variant="link" className="text-brand p-0 h-auto text-xs font-semibold">
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
        <Card className="bg-white border-neutral-200 shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <CardHeader className="flex flex-row justify-between items-center pb-3 border-b border-neutral-100 px-6 pt-5">
              <CardTitle className="text-base font-bold text-ink">Alertes de stock</CardTitle>
              <Link href="/dashboard/products">
                <Button variant="link" className="text-xs font-semibold text-brand p-0 h-auto">
                  Inventaire
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-6 pb-2">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8 space-y-2 flex flex-col items-center">
                  <div className="p-3 bg-emerald-50 rounded-full text-emerald-600 border border-emerald-100">
                    <CheckCircle className="size-6" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-700 mt-2">Stock optimal</p>
                  <p className="text-xs text-neutral-400">Tous les produits ont un niveau de stock suffisant.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {lowStockProducts.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex justify-between items-center p-2.5 rounded-lg bg-rose-50/50 border border-rose-100">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-rose-950">{p.name}</p>
                        <p className="text-[10px] text-rose-800/70">Seuil alerte : {p.lowStockAlert} unités</p>
                      </div>
                      <Badge variant="outline" className="px-2 py-0.5 text-xs font-bold rounded-md bg-rose-100 text-rose-700 border-rose-200">
                        {p.stockQty} Restant{p.stockQty > 1 && "s"}
                      </Badge>
                    </div>
                  ))}
                  {lowStockProducts.length > 5 && (
                    <p className="text-xs text-neutral-400 text-center italic mt-2">
                      Et {lowStockProducts.length - 5} autres produits en alerte...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </div>

          {lowStockProducts.length > 0 && (
            <div className="mx-6 mb-6 p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-[11px] text-rose-800 font-semibold flex items-center gap-1.5 justify-center">
              <AlertTriangle className="size-3.5 text-rose-700 shrink-0" />
              <span>Réapprovisionnement nécessaire</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
