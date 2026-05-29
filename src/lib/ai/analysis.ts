import type { ImageCategory } from "@prisma/client";
import { getOpenAI } from "@/lib/openai";

export interface ImageAnalysisResult {
  category: ImageCategory;
  description: string;
  elements: string[];
  confidence: number;
}

const CATEGORY_MAP: Record<string, ImageCategory> = {
  sketch: "SKETCH",
  drawing: "DRAWING",
  logo: "LOGO",
  ui_wireframe: "UI_WIREFRAME",
  wireframe: "UI_WIREFRAME",
  architecture: "ARCHITECTURE",
  product_concept: "PRODUCT_CONCEPT",
  illustration: "ILLUSTRATION",
  painting: "PAINTING",
};

export async function analyzeImage(
  imageBase64: string,
  mimeType: string,
): Promise<ImageAnalysisResult> {
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert visual analyst for a creative AI platform. Analyze uploaded images and classify them precisely. Respond ONLY with valid JSON matching this schema:
{
  "category": "sketch|drawing|logo|ui_wireframe|architecture|product_concept|illustration|painting|other",
  "description": "detailed description of the image content",
  "elements": ["key visual elements"],
  "confidence": 0.0-1.0
}`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this image for creative transformation.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Analysis failed: empty response");

  const parsed = JSON.parse(content) as {
    category: string;
    description: string;
    elements: string[];
    confidence: number;
  };

  const normalized = parsed.category.toLowerCase().replace(/\s+/g, "_");
  const category =
    CATEGORY_MAP[normalized] ??
    (normalized === "other" ? "OTHER" : "SKETCH");

  return {
    category,
    description: parsed.description,
    elements: parsed.elements ?? [],
    confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.8)),
  };
}
