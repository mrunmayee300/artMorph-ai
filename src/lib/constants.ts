import type { GenerationMode, PlanTier, StylePreset } from "@prisma/client";

export const PLAN_CREDITS: Record<PlanTier, number> = {
  FREE: 20,
  CREATOR: 200,
  PRO: 1000,
  TEAM: 5000,
};

export const PLAN_PRICES: Record<Exclude<PlanTier, "FREE">, number> = {
  CREATOR: 9,
  PRO: 29,
  TEAM: 99,
};

export const CREDIT_COSTS: Record<GenerationMode, number> = {
  STANDARD: 1,
  HD: 2,
  BATCH: 3,
};

export const STYLE_LABELS: Record<StylePreset, string> = {
  PHOTOREALISTIC: "Photorealistic",
  LUXURY_BRANDING: "Luxury Branding",
  ANIME: "Anime",
  MINIMALIST: "Minimalist",
  CYBERPUNK: "Cyberpunk",
  PRODUCT_DESIGN: "Product Design",
  EDITORIAL: "Editorial",
  GAME_ART: "Game Art",
  ARCHITECTURE_RENDER: "Architecture Render",
  THREE_D_VISUALIZATION: "3D Visualization",
};

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const RATE_LIMITS = {
  transform: { requests: 10, window: "1 m" as const },
  upload: { requests: 20, window: "1 m" as const },
  auth: { requests: 5, window: "15 m" as const },
};
