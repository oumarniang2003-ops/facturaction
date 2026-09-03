import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SendInvoiceButton } from "@/components/SendInvoiceButton";
import { RecordPaymentButton } from "@/components/RecordPaymentButton";
import { DeleteSaleButton } from "@/app/(dashboard)/dashboard/reports/DeleteSaleButton";
import { Card, CardContent } from "@/components/ui/card";
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
import { FileText, Plus, Phone, Edit, ExternalLink, Trash2 } from "lucide-react";

const statusLabel: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyée",
  PAID: "Payée",
  PARTIALLY_PAID: "Partiellement payée",
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

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);
  const merchantId = (session as any).merchantId;

  const invoices = await prisma.invoice.findMany({
    where: { merchantId },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
              <FileText className="size-5 text-brand" />
            </div>
            <span>Factures & devis</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1.5">
            Gérez vos documents de vente et suivez les règlements clients.
          </p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button 
            className="h-10 px-5 font-bold flex items-center gap-2 shadow-md shadow-brand/20 hover:opacity-95 transition-all duration-200 rounded-full bg-gradient-to-r from-brand to-[#7C6FF0] text-white"
          >
            <Plus className="size-4.5" />
            <span>Nouvelle facture</span>
          </Button>
        </Link>
      </div>

      {invoices.length === 0 ? (
        <Card className="bg-white border-neutral-200/60 shadow-sm rounded-2xl">
          <CardContent className="p-10 text-center text-neutral-500 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center mb-3 text-neutral-400 border border-neutral-100">
              <FileText className="size-6" />
            </div>
            <p className="text-sm font-semibold text-neutral-700">Aucune facture pour le moment</p>
            <p className="text-xs text-neutral-400 mt-1">Créez votre première facture pour la voir s'afficher ici.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Vue mobile : cartes empilées */}
          <div className="md:hidden space-y-4">
            {invoices.map((inv) => {
              const badgeStyle = statusBadgeStyles[inv.status] || statusBadgeStyles.DRAFT;
              return (
                <Card key={inv.id} className="bg-white border-neutral-200/60 shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-ink text-sm">{inv.number}</p>
                        <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">
                          {new Date(inv.issueDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <p className="font-display font-extrabold text-ink text-base">{Number(inv.total).toLocaleString("fr-FR")} F</p>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-neutral-700 font-bold">{inv.client.name}</div>
                      {inv.client.phone && (
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                          <Phone className="size-3 text-neutral-400" />
                          <span>{inv.client.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant="outline" 
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                      >
                        {statusLabel[inv.status]}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-100/60 pt-4 mt-1">
                      <div className="flex gap-4 text-xs font-bold">
                        <a 
                          href={`/api/invoices/${inv.id}/pdf`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-brand hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="size-3.5" />
                          <span>PDF</span>
                        </a>
                        <Link 
                          href={`/dashboard/invoices/${inv.id}/edit`} 
                          className="text-neutral-400 hover:text-neutral-600 flex items-center gap-1"
                        >
                          <Edit className="size-3.5" />
                          <span>Modifier</span>
                        </Link>
                        <DeleteSaleButton invoiceId={inv.id} invoiceNumber={inv.number} variant="button" />
                      </div>
                      <SendInvoiceButton invoiceId={inv.id} />
                    </div>

                    <div className="pt-1">
                      <RecordPaymentButton
                        invoiceId={inv.id}
                        invoiceNumber={inv.number}
                        total={Number(inv.total)}
                        advanceReceived={Number(inv.advanceReceived)}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Vue desktop : tableau complet */}
          <Card className="hidden md:block bg-white border-neutral-200/60 shadow-sm rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-neutral-50/50 border-b border-neutral-100/60">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4 py-3 font-bold text-neutral-400 text-[10px] uppercase tracking-wider h-11">Date</TableHead>
                  <TableHead className="px-4 py-3 font-bold text-neutral-400 text-[10px] uppercase tracking-wider h-11">Numéro</TableHead>
                  <TableHead className="px-4 py-3 font-bold text-neutral-400 text-[10px] uppercase tracking-wider h-11">Client</TableHead>
                  <TableHead className="px-4 py-3 font-bold text-neutral-400 text-[10px] uppercase tracking-wider h-11">Téléphone</TableHead>
                  <TableHead className="px-4 py-3 font-bold text-neutral-400 text-[10px] uppercase tracking-wider h-11">Adresse</TableHead>
                  <TableHead className="px-4 py-3 font-bold text-neutral-400 text-[10px] uppercase tracking-wider h-11">Statut</TableHead>
                  <TableHead className="px-4 py-3 font-bold text-neutral-400 text-[10px] uppercase tracking-wider h-11 text-right">Total</TableHead>
                  <TableHead className="px-4 py-3 font-bold text-neutral-400 text-[10px] uppercase tracking-wider h-11 text-center">Paiement</TableHead>
                  <TableHead className="px-4 py-3 font-bold text-neutral-400 text-[10px] uppercase tracking-wider h-11 text-right">Actions</TableHead>
                  <TableHead className="px-4 py-3 font-bold text-neutral-400 text-[10px] uppercase tracking-wider h-11 text-right">Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-neutral-100/60">
                {invoices.map((inv) => {
                  const badgeStyle = statusBadgeStyles[inv.status] || statusBadgeStyles.DRAFT;
                  return (
                    <TableRow key={inv.id} className="hover:bg-neutral-50/20 border-b border-neutral-100/40 transition-colors">
                      <TableCell className="px-4 py-3.5 text-neutral-500 text-xs font-semibold">
                        {new Date(inv.issueDate).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="px-4 py-3.5 font-bold text-ink text-xs">{inv.number}</TableCell>
                      <TableCell className="px-4 py-3.5 font-bold text-neutral-800 text-xs">{inv.client.name}</TableCell>
                      <TableCell className="px-4 py-3.5 text-neutral-500 text-xs font-medium">{inv.client.phone || "—"}</TableCell>
                      <TableCell className="px-4 py-3.5 text-neutral-500 text-xs max-w-[150px] truncate font-medium" title={inv.client.address || ""}>
                        {inv.client.address || "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3.5">
                        <Badge 
                          variant="outline" 
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        >
                          {statusLabel[inv.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-right font-display font-extrabold text-ink text-xs">
                        {Number(inv.total).toLocaleString("fr-FR")} F
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-center">
                        <RecordPaymentButton
                          invoiceId={inv.id}
                          invoiceNumber={inv.number}
                          total={Number(inv.total)}
                          advanceReceived={Number(inv.advanceReceived)}
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-right text-xs">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/invoices/${inv.id}/edit`}>
                            <Button variant="outline" className="h-8 text-[11px] px-3 border-neutral-200 hover:bg-neutral-50 bg-white rounded-full font-bold flex items-center gap-1">
                              <Edit className="size-3.5 text-neutral-400" />
                              <span>Modifier</span>
                            </Button>
                          </Link>
                          <a
                            href={`/api/invoices/${inv.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button variant="outline" className="h-8 text-[11px] px-3 border-neutral-200 hover:bg-neutral-50 bg-white rounded-full font-bold flex items-center gap-1">
                              <ExternalLink className="size-3.5 text-neutral-400" />
                              <span>PDF</span>
                            </Button>
                          </a>
                          <DeleteSaleButton invoiceId={inv.id} invoiceNumber={inv.number} variant="button" />
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-right">
                        <SendInvoiceButton invoiceId={inv.id} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
