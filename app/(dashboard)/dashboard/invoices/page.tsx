import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SendInvoiceButton } from "@/components/SendInvoiceButton";

const statusLabel: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyée",
  PAID: "Payée",
  PARTIALLY_PAID: "Partiellement payée",
  OVERDUE: "En retard",
  CANCELED: "Annulée",
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Factures & devis</h1>
        <Link
          href="/dashboard/invoices/new"
          className="rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Nouvelle facture
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-10 text-center text-neutral-500">
          Aucune facture pour le moment. Créez la première pour la voir apparaître ici.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-left">
              <tr>
                <th className="px-4 py-3">Numéro</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">PDF</th>
                <th className="px-4 py-3 text-right">Email</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-medium text-ink">{inv.number}</td>
                  <td className="px-4 py-3">{inv.client.name}</td>
                  <td className="px-4 py-3">{statusLabel[inv.status]}</td>
                  <td className="px-4 py-3 text-right">{inv.total.toString()} €</td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/api/invoices/${inv.id}/pdf`}
                      target="_blank"
                      className="text-brand hover:underline font-medium"
                    >
                      Voir
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <SendInvoiceButton invoiceId={inv.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
