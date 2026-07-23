import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { InvoicePdf } from "@/components/InvoicePdf";

/**
 * Charge une facture depuis la base et génère son PDF en mémoire.
 * Toujours filtrée par merchantId pour éviter qu'un commerçant génère
 * la facture d'un autre.
 */
export async function generateInvoicePdfBuffer(invoiceId: string, merchantId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, merchantId },
    include: { client: true, items: true, merchant: true },
  });

  if (!invoice) return null;

  const pdfBuffer = await renderToBuffer(
    <InvoicePdf
      merchant={{
        businessName: invoice.merchant.businessName,
        address: invoice.merchant.address,
        email: invoice.merchant.email,
        vatNumber: invoice.merchant.vatNumber,
        phone: invoice.merchant.phone,
      }}
      client={{
        name: invoice.client.name,
        address: invoice.client.address,
        email: invoice.client.email,
        vatNumber: invoice.client.vatNumber,
        phone: invoice.client.phone,
      }}
      invoice={{
        number: invoice.number,
        type: invoice.type,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        subtotal: Number(invoice.subtotal),
        vatTotal: Number(invoice.vatTotal),
        total: Number(invoice.total),
        advanceReceived: Number(invoice.advanceReceived),
        paymentMethod: invoice.paymentMethod,
        notes: invoice.notes,
      }}
      items={invoice.items.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        vatRate: Number(it.vatRate),
        lineTotal: Number(it.lineTotal),
      }))}
    />
  );

  return { pdfBuffer, invoice };
}
