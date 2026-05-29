import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { PlanTier } from "@prisma/client";
import { headers } from "next/headers";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { PLAN_CREDITS } from "@/lib/constants";
import { resetMonthlyCredits } from "@/lib/credits";
import { stripe, planFromPriceId } from "@/lib/stripe";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const body = await request.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const existing = await db.stripeWebhookEvent.findUnique({
    where: { eventId: event.id },
  });
  if (existing?.processed) {
    return NextResponse.json({ received: true });
  }

  await db.stripeWebhookEvent.upsert({
    where: { eventId: event.id },
    create: {
      eventId: event.id,
      type: event.type,
      payload: JSON.parse(JSON.stringify(event)),
    },
    update: {},
  });

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.created":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
    }

    await db.stripeWebhookEvent.update({
      where: { eventId: event.id },
      data: { processed: true },
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan as PlanTier | undefined;
  if (!userId || !plan) return;

  await db.subscription.update({
    where: { userId },
    data: {
      plan,
      status: "ACTIVE",
      stripeSubscriptionId: session.subscription as string,
      stripePriceId: session.metadata?.priceId,
    },
  });

  await resetMonthlyCredits(userId, PLAN_CREDITS[plan]);
  await logAudit({
    userId,
    action: "subscription.created",
    resource: plan,
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const sub = await db.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });
  if (!sub) return;

  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceId ? planFromPriceId(priceId) : null;

  await db.subscription.update({
    where: { id: sub.id },
    data: {
      status: mapStripeStatus(subscription.status),
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      plan: plan ?? sub.plan,
      currentPeriodStart: getSubscriptionPeriodStart(subscription),
      currentPeriodEnd: getSubscriptionPeriodEnd(subscription),
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const sub = await db.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });
  if (!sub) return;

  await db.subscription.update({
    where: { id: sub.id },
    data: {
      plan: "FREE",
      status: "CANCELED",
      stripeSubscriptionId: null,
      cancelAtPeriodEnd: false,
    },
  });

  await resetMonthlyCredits(sub.userId, PLAN_CREDITS.FREE);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId =
    typeof invoice.parent?.subscription_details?.subscription === "string"
      ? invoice.parent.subscription_details.subscription
      : null;
  if (!subscriptionId || invoice.billing_reason !== "subscription_cycle") {
    return;
  }

  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;
  if (!customerId) return;
  const sub = await db.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });
  if (!sub || sub.plan === "FREE") return;

  await resetMonthlyCredits(sub.userId, PLAN_CREDITS[sub.plan]);
}

function getSubscriptionPeriodStart(subscription: Stripe.Subscription): Date | undefined {
  const start =
    (subscription as Stripe.Subscription & { current_period_start?: number })
      .current_period_start;
  return start ? new Date(start * 1000) : undefined;
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date | undefined {
  const end =
    (subscription as Stripe.Subscription & { current_period_end?: number })
      .current_period_end;
  return end ? new Date(end * 1000) : undefined;
}

function mapStripeStatus(
  status: Stripe.Subscription.Status,
): "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING" | "INCOMPLETE" | "INCOMPLETE_EXPIRED" | "UNPAID" | "PAUSED" {
  const map: Record<string, "ACTIVE" | "CANCELED" | "PAST_DUE"> = {
    active: "ACTIVE",
    canceled: "CANCELED",
    past_due: "PAST_DUE",
    trialing: "TRIALING" as "ACTIVE",
    incomplete: "INCOMPLETE" as "ACTIVE",
    incomplete_expired: "INCOMPLETE_EXPIRED" as "CANCELED",
    unpaid: "UNPAID" as "PAST_DUE",
    paused: "PAUSED" as "ACTIVE",
  };
  return map[status] ?? "ACTIVE";
}
