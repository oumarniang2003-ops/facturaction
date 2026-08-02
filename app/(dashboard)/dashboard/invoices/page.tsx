import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SendInvoiceButton } from "@/components/SendInvoiceButton";
import { RecordPaymentButton } from "@/components/RecordPaymentButton";
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
import { FileText, Plus, Mail, Phone, MapPin, Edit, ExternalLink } from "lucide-react";

const statusLabel: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyée",
  PAID: "Payée",
  PARTIALLY_PAID: "Partiellement payée",
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
            <FileText className="size-6 text-brand" /> Factures & devis
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gérez vos documents de vente, suivez le statut de paiement de vos clients.
          </p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button 
            className="h-10 px-4 font-semibold flex items-center gap-2 shadow-sm hover:shadow transition-all duration-200 rounded-lg"
          >
            <Plus className="size-4" />
            <span>Nouvelle facture</span>
          </Button>
        </Link>
      </div>

      {invoices.length === 0 ? (
        <Card className="bg-white border-neutral-200 shadow-sm rounded-xl">
          <CardContent className="p-10 text-center text-neutral-500 flex flex-col items-center justify-center">
            <FileText className="size-8 text-neutral-300 mb-2" />
            <p className="text-sm">Aucune facture pour le moment. Créez la première pour la voir apparaître ici.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Vue mobile : cartes empilées */}
          <div className="md:hidden space-y-3">
            {invoices.map((inv) => {
              const badgeStyle = statusBadgeStyles[inv.status] || statusBadgeStyles.DRAFT;
              return (
                <Card key={inv.id} className="bg-white border-neutral-200 shadow-sm rounded-xl overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-ink text-sm">{inv.number}</p>
                        <p className="text-[10px] text-neutral-400">
                          {new Date(inv.issueDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <p className="font-bold text-ink text-sm">{Number(inv.total).toLocaleString("fr-FR")} F</p>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-neutral-700 font-semibold">{inv.client.name}</div>
                      {inv.client.phone && (
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                          <Phone className="size-3 text-neutral-400" />
                          <span>{inv.client.phone}</span>
                        </div>
                      )}
                    </div>

                    <Badge 
                      variant="outline" 
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                    >
                      {statusLabel[inv.status]}
                    </Badge>

                    <div className="flex items-center justify-between border-t border-neutral-100 pt-3 mt-1">
                      <div className="flex gap-4 text-xs font-semibold">
                        <a 
                          href={`/api/invoices/${inv.id}/pdf`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-brand hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="size-3" />
                          <span>PDF</span>
                        </a>
                        <Link 
                          href={`/dashboard/invoices/${inv.id}/edit`} 
                          className="text-neutral-500 hover:text-neutral-700 flex items-center gap-1"
                        >
                          <Edit className="size-3" />
                          <span>Modifier</span>
                        </Link>
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
          <Card className="hidden md:block bg-white border-neutral-200 shadow-sm rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-neutral-50/75 border-b border-neutral-100">
                <TableRow>
                  <TableHead className="px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider h-10">Date</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider h-10">Numéro</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider h-10">Client</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider h-10">Téléphone</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider h-10">Adresse</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider h-10">Statut</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider h-10 text-right">Total</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider h-10 text-center">Paiement</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider h-10 text-right">Actions</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider h-10 text-right">Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-neutral-100">
                {invoices.map((inv) => {
                  const badgeStyle = statusBadgeStyles[inv.status] || statusBadgeStyles.DRAFT;
                  return (
                    <TableRow key={inv.id} className="hover:bg-neutral-50/40 transition-colors">
                      <TableCell className="px-4 py-3 text-neutral-500 text-xs">
                        {new Date(inv.issueDate).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-semibold text-ink text-xs">{inv.number}</TableCell>
                      <TableCell className="px-4 py-3 font-semibold text-neutral-800 text-xs">{inv.client.name}</TableCell>
                      <TableCell className="px-4 py-3 text-neutral-500 text-xs">{inv.client.phone || "—"}</TableCell>
                      <TableCell className="px-4 py-3 text-neutral-500 text-xs max-w-[150px] truncate" title={inv.client.address || ""}>
                        {inv.client.address || "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge 
                          variant="outline" 
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        >
                          {statusLabel[inv.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right font-bold text-ink text-xs">
                        {Number(inv.total).toLocaleString("fr-FR")} F
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <RecordPaymentButton
                          invoiceId={inv.id}
                          invoiceNumber={inv.number}
                          total={Number(inv.total)}
                          advanceReceived={Number(inv.advanceReceived)}
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right text-xs">
                        <div className="flex justify-end gap-3">
                          <Link href={`/dashboard/invoices/${inv.id}/edit`}>
                            <Button variant="outline" className="h-7 text-[11px] px-2.5 border-neutral-300 hover:bg-neutral-50 bg-white rounded-md font-semibold flex items-center gap-1">
                              <Edit className="size-3 text-neutral-500" />
                              <span>Modifier</span>
                            </Button>
                          </Link>
                          <a
                            href={`/api/invoices/${inv.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button variant="outline" className="h-7 text-[11px] px-2.5 border-neutral-300 hover:bg-neutral-50 bg-white rounded-md font-semibold flex items-center gap-1">
                              <ExternalLink className="size-3 text-neutral-500" />
                              <span>PDF</span>
                            </Button>
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
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
