import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Stripe envoie une signature dans le header pour prouver que l'événement
// vient bien de Stripe et n'a pas été falsifié. On la vérifie systématiquement.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err: any) {
    console.error("Signature webhook invalide:", err.message);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  switch (event.type) {
    // Le commerçant vient de payer son premier abonnement
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const merchantId = session.metadata?.merchantId;
      const plan = session.metadata?.plan as "STARTER" | "PRO" | "BUSINESS" | undefined;
      if (!merchantId || !plan) break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

      await prisma.subscription.update({
        where: { merchantId },
        data: {
          plan,
          status: "ACTIVE",
          stripeCustomerId: session.customer as string,
          stripeSubId: subscription.id,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
      break;
    }

    // Renouvellement mensuel réussi → on prolonge la période
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const sub = await prisma.subscription.findFirst({
        where: { stripeSubId: invoice.subscription as string },
      });
      if (!sub) break;

      const stripeSub = await stripe.subscriptions.retrieve(invoice.subscription as string);
      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status: "ACTIVE",
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        },
      });
      break;
    }

    // Paiement du renouvellement échoué → on marque en retard
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const sub = await prisma.subscription.findFirst({
        where: { stripeSubId: invoice.subscription as string },
      });
      if (!sub) break;

      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "PAST_DUE" },
      });
      break;
    }

    // Abonnement annulé (par le commerçant ou après trop d'échecs de paiement)
    case "customer.subscription.deleted": {
      const stripeSub = event.data.object as Stripe.Subscription;
      const sub = await prisma.subscription.findFirst({
        where: { stripeSubId: stripeSub.id },
      });
      if (!sub) break;

      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "CANCELED" },
      });
      break;
    }

    default:
      // Événements non gérés : on les ignore silencieusement
      break;
  }

  return NextResponse.json({ received: true });
}

