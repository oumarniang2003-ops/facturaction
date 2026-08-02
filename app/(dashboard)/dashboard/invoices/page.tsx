import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SendInvoiceButton } from "@/components/SendInvoiceButton";
import { RecordPaymentButton } from "@/components/RecordPaymentButton";

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
        <>
          {/* Vue mobile : cartes empilées, plus lisible qu'un tableau à 10 colonnes sur petit écran */}
          <div className="md:hidden space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-ink">{inv.number}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(inv.issueDate).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <p className="font-semibold text-ink">{Number(inv.total).toLocaleString("fr-FR")} F</p>
                </div>

                <div className="text-sm text-neutral-700 mb-1">{inv.client.name}</div>
                {inv.client.phone && (
                  <div className="text-xs text-neutral-500 mb-2">{inv.client.phone}</div>
                )}

                <span className="inline-block text-xs bg-neutral-100 text-neutral-600 rounded-full px-2.5 py-1 mb-3">
                  {statusLabel[inv.status]}
                </span>

                <div className="flex items-center justify-between border-t border-neutral-100 pt-3 mt-1">
                  <div className="flex gap-3 text-sm">
                    <a href={`/api/invoices/${inv.id}/pdf`} target="_blank" className="text-brand font-medium">
                      Voir PDF
                    </a>
                    <Link href={`/dashboard/invoices/${inv.id}/edit`} className="text-neutral-500 font-medium">
                      Modifier
                    </Link>
                  </div>
                  <SendInvoiceButton invoiceId={inv.id} />
                </div>

                <div className="mt-2">
                  <RecordPaymentButton
                    invoiceId={inv.id}
                    invoiceNumber={inv.number}
                    total={Number(inv.total)}
                    advanceReceived={Number(inv.advanceReceived)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Vue desktop : tableau complet, avec défilement horizontal de sécurité si l'écran est étroit */}
          <div className="hidden md:block bg-white rounded-xl border border-neutral-200 overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-neutral-50 text-neutral-500 text-left">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Numéro</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Téléphone</th>
                  <th className="px-4 py-3">Adresse</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Paiement</th>
                  <th className="px-4 py-3 text-right">PDF</th>
                  <th className="px-4 py-3 text-right">Email</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-neutral-100">
                    <td className="px-4 py-3 text-neutral-500">
                      {new Date(inv.issueDate).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{inv.number}</td>
                    <td className="px-4 py-3 font-semibold text-ink">{inv.client.name}</td>
                    <td className="px-4 py-3 text-neutral-600">{inv.client.phone || "—"}</td>
                    <td className="px-4 py-3 text-neutral-500 max-w-[150px] truncate" title={inv.client.address || ""}>
                      {inv.client.address || "—"}
                    </td>
                    <td className="px-4 py-3">{statusLabel[inv.status]}</td>
                    <td className="px-4 py-3 text-right font-medium">{Number(inv.total).toLocaleString("fr-FR")} F</td>
                    <td className="px-4 py-3 text-center">
                      <RecordPaymentButton
                        invoiceId={inv.id}
                        invoiceNumber={inv.number}
                        total={Number(inv.total)}
                        advanceReceived={Number(inv.advanceReceived)}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/invoices/${inv.id}/edit`}
                        className="text-neutral-500 hover:text-brand hover:underline font-medium mr-3"
                      >
                        Modifier
                      </Link>
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
        </>
      )}
    </div>
  );
}
