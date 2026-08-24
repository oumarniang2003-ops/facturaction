import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  plan: z.enum(["STARTER", "PRO", "BUSINESS"]).optional(),
  status: z.enum(["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  if (!parsed.data.plan && !parsed.data.status) {
    return NextResponse.json({ error: "Aucune modification fournie" }, { status: 400 });
  }

  const subscription = await prisma.subscription.update({
    where: { merchantId: params.id },
    data: parsed.data,
  });

  return NextResponse.json(subscription);
}
