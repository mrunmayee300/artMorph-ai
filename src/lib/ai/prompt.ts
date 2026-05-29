import type { ImageCategory, StylePreset } from "@prisma/client";
import { STYLE_LABELS } from "@/lib/constants";
import { openai } from "@/lib/openai";

export async function optimizePrompt(
  category: ImageCategory,
  style: StylePreset,
  description: string,
  elements: string[],
): Promise<string> {
  const styleLabel = STYLE_LABELS[style];
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert prompt engineer for OpenAI image generation. Create a single optimized prompt (max 800 chars) that transforms the input into professional ${styleLabel} output. Focus on composition, lighting, materials, and commercial quality. No markdown, no quotes wrapping.`,
      },
      {
        role: "user",
        content: `Input category: ${category}\nStyle: ${styleLabel}\nDescription: ${description}\nKey elements: ${elements.join(", ")}`,
      },
    ],
    max_tokens: 300,
  });

  const prompt = response.choices[0]?.message?.content?.trim();
  if (!prompt) {
    return `Professional ${styleLabel} transformation of ${description}, highly detailed, commercial quality, refined composition`;
  }
  return prompt;
}
