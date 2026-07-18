import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  businessName: z.string().min(2),
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

// Chaque inscription crée UN nouveau Merchant (boutique) isolé,
// avec son propre espace de données, et un utilisateur OWNER.
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { businessName, ownerName, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
  }

  const slug = businessName
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const passwordHash = await bcrypt.hash(password, 10);

  const merchant = await prisma.merchant.create({
    data: {
      businessName,
      slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
      email,
      users: {
        create: { name: ownerName, email, passwordHash, role: "OWNER" },
      },
      subscription: {
        create: { plan: "STARTER", status: "TRIALING" },
      },
    },
  });

  return NextResponse.json({ merchantId: merchant.id }, { status: 201 });
}
