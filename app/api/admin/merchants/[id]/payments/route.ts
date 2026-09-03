import { NextResponse } from "next/server";
import { z } from "zod";
import { PaymentMethod } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const subscription = await prisma.subscription.findUnique({
    where: { merchantId: params.id },
    include: { payments: { orderBy: { paidAt: "desc" } } },
  });
  if (!subscription) {
    return NextResponse.json({ error: "Abonnement introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    paidUntil: subscription.paidUntil,
    payments: subscription.payments,
  });
}

const paymentSchema = z.object({
  amount: z.number().positive(),
  method: z.nativeEnum(PaymentMethod),
  paidUntil: z.string().refine((v) => !isNaN(Date.parse(v)), "Date invalide"),
  note: z.string().trim().max(280).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json();
  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const subscription = await prisma.subscription.findUnique({ where: { merchantId: params.id } });
  if (!subscription) {
    return NextResponse.json({ error: "Abonnement introuvable" }, { status: 404 });
  }

  const [payment] = await prisma.$transaction([
    prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        amount: parsed.data.amount,
        method: parsed.data.method,
        note: parsed.data.note || null,
      },
    }),
    prisma.subscription.update({
      where: { id: subscription.id },
      data: { paidUntil: new Date(parsed.data.paidUntil), status: "ACTIVE" },
    }),
  ]);

  return NextResponse.json({ success: true, payment });
}
