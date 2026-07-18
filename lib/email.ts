import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendInvoiceEmailParams = {
  to: string;
  merchantName: string;
  invoiceNumber: string;
  total: number;
  pdfBuffer: Buffer;
  isReminder?: boolean;
};

/**
 * Envoie la facture (ou une relance) au client, avec le PDF en pièce jointe.
 * Utilise Resend (resend.com) — un compte gratuit suffit pour démarrer.
 */
export async function sendInvoiceEmail({
  to,
  merchantName,
  invoiceNumber,
  total,
  pdfBuffer,
  isReminder = false,
}: SendInvoiceEmailParams) {
  const subject = isReminder
    ? `Rappel — Facture ${invoiceNumber} en attente de paiement`
    : `${merchantName} — Votre facture ${invoiceNumber}`;

  const introText = isReminder
    ? `Nous n'avons pas encore reçu le paiement de la facture ${invoiceNumber} d'un montant de ${total.toFixed(2)} €. Vous trouverez le document ci-joint.`
    : `Merci pour votre confiance. Vous trouverez ci-joint votre facture ${invoiceNumber} d'un montant de ${total.toFixed(2)} €.`;

  return resend.emails.send({
    from: process.env.EMAIL_FROM ?? "facturation@votredomaine.com",
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; color: #1B2320; line-height: 1.6;">
        <p>Bonjour,</p>
        <p>${introText}</p>
        <p>Cordialement,<br/>${merchantName}</p>
      </div>
    `,
    attachments: [
      { filename: `${invoiceNumber}.pdf`, content: pdfBuffer.toString("base64") },
    ],
  });
}
