import Stripe from "stripe";
import type { PlanTier } from "@prisma/client";
import { env } from "@/lib/env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  typescript: true,
});

export const STRIPE_PRICE_IDS: Record<Exclude<PlanTier, "FREE">, string> = {
  CREATOR: env.STRIPE_PRICE_CREATOR,
  PRO: env.STRIPE_PRICE_PRO,
  TEAM: env.STRIPE_PRICE_TEAM,
};

export function planFromPriceId(priceId: string): PlanTier | null {
  if (priceId === env.STRIPE_PRICE_CREATOR) return "CREATOR";
  if (priceId === env.STRIPE_PRICE_PRO) return "PRO";
  if (priceId === env.STRIPE_PRICE_TEAM) return "TEAM";
  return null;
}
