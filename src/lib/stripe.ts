import Stripe from "stripe";
import type { PlanTier } from "@prisma/client";
import { env } from "@/lib/env";

let stripeClient: Stripe | undefined;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const apiKey = env.STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeClient = new Stripe(apiKey, { typescript: true });
  }
  return stripeClient;
}

export const STRIPE_PRICE_IDS: Record<Exclude<PlanTier, "FREE">, string> = {
  CREATOR: env.STRIPE_PRICE_CREATOR ?? process.env.STRIPE_PRICE_CREATOR ?? "",
  PRO: env.STRIPE_PRICE_PRO ?? process.env.STRIPE_PRICE_PRO ?? "",
  TEAM: env.STRIPE_PRICE_TEAM ?? process.env.STRIPE_PRICE_TEAM ?? "",
};

export function planFromPriceId(priceId: string): PlanTier | null {
  if (priceId === STRIPE_PRICE_IDS.CREATOR) return "CREATOR";
  if (priceId === STRIPE_PRICE_IDS.PRO) return "PRO";
  if (priceId === STRIPE_PRICE_IDS.TEAM) return "TEAM";
  return null;
}
