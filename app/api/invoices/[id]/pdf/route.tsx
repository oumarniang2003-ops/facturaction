import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateInvoicePdfBuffer } from "@/lib/generate-invoice-pdf";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const result = await generateInvoicePdfBuffer(params.id, (session as any).merchantId);
  if (!result) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  return new NextResponse(result.pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${result.invoice.number}.pdf"`,
    },
  });
}
