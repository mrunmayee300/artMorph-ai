import type { ImageCategory, StylePreset } from "@prisma/client";
import { openai } from "@/lib/openai";

export interface StyleRecommendation {
  style: StylePreset;
  reason: string;
  score: number;
}

const VALID_STYLES: StylePreset[] = [
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
];

export async function recommendStyles(
  category: ImageCategory,
  description: string,
  elements: string[],
): Promise<StyleRecommendation[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Recommend the best output styles for transforming creative inputs. Valid styles: ${VALID_STYLES.join(", ")}. Respond ONLY with JSON: { "recommendations": [{ "style": "STYLE_NAME", "reason": "why", "score": 0.0-1.0 }] }`,
      },
      {
        role: "user",
        content: `Category: ${category}\nDescription: ${description}\nElements: ${elements.join(", ")}`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 400,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Style recommendation failed");

  const parsed = JSON.parse(content) as {
    recommendations: Array<{
      style: string;
      reason: string;
      score: number;
    }>;
  };

  return (parsed.recommendations ?? [])
    .filter((r) => VALID_STYLES.includes(r.style as StylePreset))
    .map((r) => ({
      style: r.style as StylePreset,
      reason: r.reason,
      score: r.score,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
