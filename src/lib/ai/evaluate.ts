import { openai } from "@/lib/openai";

export interface QualityEvaluation {
  quality: number;
  detail: number;
  composition: number;
  commercial: number;
  summary: string;
}

export async function evaluateOutput(
  resultImageBase64: string,
  mimeType: string,
  originalPrompt: string,
): Promise<QualityEvaluation> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Evaluate AI-generated creative output. Score each dimension 0-10. Respond ONLY with JSON:
{
  "quality": number,
  "detail": number,
  "composition": number,
  "commercial": number,
  "summary": "brief assessment"
}`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: `Target prompt: ${originalPrompt}` },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${resultImageBase64}`,
            },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 300,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return {
      quality: 7,
      detail: 7,
      composition: 7,
      commercial: 7,
      summary: "Evaluation unavailable",
    };
  }

  const parsed = JSON.parse(content) as QualityEvaluation;
  return {
    quality: clampScore(parsed.quality),
    detail: clampScore(parsed.detail),
    composition: clampScore(parsed.composition),
    commercial: clampScore(parsed.commercial),
    summary: parsed.summary ?? "",
  };
}

function clampScore(value: number): number {
  return Math.min(10, Math.max(0, Number(value) || 0));
}
