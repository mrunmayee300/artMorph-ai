import type { PlanTier } from "@prisma/client";

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  price: number;
  credits: number;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: PlanDefinition[] = [
  {
    tier: "FREE",
    name: "Free",
    price: 0,
    credits: 20,
    description: "Try ArtMorph with essential transforms.",
    features: [
      "20 credits per month",
      "Standard generation",
      "Project organization",
      "Version history",
    ],
  },
  {
    tier: "CREATOR",
    name: "Creator",
    price: 9,
    credits: 200,
    description: "For independent creators shipping visual work.",
    features: [
      "200 credits per month",
      "HD generation",
      "Priority processing",
      "Email support",
    ],
  },
  {
    tier: "PRO",
    name: "Pro",
    price: 29,
    credits: 1000,
    description: "For professionals with high-volume workflows.",
    features: [
      "1,000 credits per month",
      "Batch generation",
      "Advanced style presets",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    tier: "TEAM",
    name: "Team",
    price: 99,
    credits: 5000,
    description: "For teams collaborating on creative production.",
    features: [
      "5,000 credits per month",
      "Shared billing",
      "Admin analytics",
      "Dedicated support",
    ],
  },
];

export function getPlanByTier(tier: PlanTier): PlanDefinition {
  const plan = PLANS.find((p) => p.tier === tier);
  if (!plan) throw new Error(`Unknown plan tier: ${tier}`);
  return plan;
}
