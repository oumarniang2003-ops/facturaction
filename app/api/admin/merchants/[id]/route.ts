import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  plan: z.enum(["STARTER", "PRO", "BUSINESS"]).optional(),
  status: z.enum(["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED"]).optional(),
  phone: z.string().trim().min(6).max(20).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { plan, status, phone } = parsed.data;
  if (!plan && !status && !phone) {
    return NextResponse.json({ error: "Aucune modification fournie" }, { status: 400 });
  }

  if (phone) {
    await prisma.merchant.update({ where: { id: params.id }, data: { phone } });
  }
  if (plan || status) {
    await prisma.subscription.update({
      where: { merchantId: params.id },
      data: { ...(plan && { plan }), ...(status && { status }) },
    });
  }

  return NextResponse.json({ success: true });
}
