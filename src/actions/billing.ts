"use server";

import type { PlanTier } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { absoluteUrl } from "@/lib/utils";
import { db } from "@/lib/db";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";

export async function createCheckoutSessionAction(
  plan: Exclude<PlanTier, "FREE">,
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect("/login");
  }

  const userId = session.user.id;
  let subscription = await db.subscription.findUnique({
    where: { userId },
  });

  let customerId = subscription?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: session.user.name ?? undefined,
      metadata: { userId },
    });
    customerId = customer.id;
    subscription = await db.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId: customerId,
        plan: "FREE",
        status: "ACTIVE",
      },
      update: { stripeCustomerId: customerId },
    });
  }

  const checkout = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: STRIPE_PRICE_IDS[plan], quantity: 1 }],
    success_url: absoluteUrl("/dashboard/billing?success=1"),
    cancel_url: absoluteUrl("/dashboard/billing?canceled=1"),
    metadata: { userId, plan },
  });

  if (!checkout.url) throw new Error("Failed to create checkout session");
  redirect(checkout.url);
}

export async function createBillingPortalAction(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (!subscription?.stripeCustomerId) {
    redirect("/pricing");
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: absoluteUrl("/dashboard/billing"),
  });

  redirect(portal.url);
}
