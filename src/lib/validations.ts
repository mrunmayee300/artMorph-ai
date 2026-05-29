import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const projectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const transformSchema = z.object({
  generationId: z.string().cuid(),
  style: z.enum([
    "PHOTOREALISTIC",
    "LUXURY_BRANDING",
    "ANIME",
    "MINIMALIST",
    "CYBERPUNK",
    "PRODUCT_DESIGN",
    "EDITORIAL",
    "GAME_ART",
    "ARCHITECTURE_RENDER",
    "THREE_D_VISUALIZATION",
  ]),
  mode: z.enum(["STANDARD", "HD", "BATCH"]).default("STANDARD"),
  projectId: z.string().cuid().optional(),
});

export const settingsSchema = z.object({
  name: z.string().min(2).max(100),
});

export const moveGenerationSchema = z.object({
  generationId: z.string().cuid(),
  projectId: z.string().cuid().nullable(),
});
