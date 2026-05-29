import type { GenerationMode, StylePreset } from "@prisma/client";
import { analyzeImage } from "@/lib/ai/analysis";
import { evaluateOutput } from "@/lib/ai/evaluate";
import { generateTransformedImage } from "@/lib/ai/generate";
import { optimizePrompt } from "@/lib/ai/prompt";
import { recommendStyles } from "@/lib/ai/styles";
import { db } from "@/lib/db";
import { getStorage } from "@/lib/storage";

export interface PipelineInput {
  generationId: string;
  userId: string;
  imageBuffer: Buffer;
  mimeType: string;
  style: StylePreset;
  mode: GenerationMode;
}

export async function runAnalysisOnly(
  generationId: string,
  imageBase64: string,
  mimeType: string,
) {
  const analysis = await analyzeImage(imageBase64, mimeType);
  const recommendations = await recommendStyles(
    analysis.category,
    analysis.description,
    analysis.elements,
  );

  await db.generation.update({
    where: { id: generationId },
    data: {
      status: "PENDING",
      category: analysis.category,
      analysisJson: JSON.parse(JSON.stringify(analysis)),
      recommendations: JSON.parse(JSON.stringify(recommendations)),
    },
  });

  return { analysis, recommendations };
}

export async function runTransformationPipeline(
  input: PipelineInput,
): Promise<void> {
  const { generationId, imageBuffer, mimeType, style, mode } = input;
  const imageBase64 = imageBuffer.toString("base64");

  try {
    await db.generation.update({
      where: { id: generationId },
      data: { status: "ANALYZING" },
    });

    const analysis = await analyzeImage(imageBase64, mimeType);
    const recommendations = await recommendStyles(
      analysis.category,
      analysis.description,
      analysis.elements,
    );

    await db.generation.update({
      where: { id: generationId },
      data: {
        category: analysis.category,
        analysisJson: JSON.parse(JSON.stringify(analysis)),
        recommendations: JSON.parse(JSON.stringify(recommendations)),
        style,
        status: "GENERATING",
      },
    });

    const optimizedPrompt = await optimizePrompt(
      analysis.category,
      style,
      analysis.description,
      analysis.elements,
    );

    await db.generation.update({
      where: { id: generationId },
      data: { optimizedPrompt },
    });

    const generated = await generateTransformedImage(
      optimizedPrompt,
      imageBuffer,
      mimeType,
      mode,
    );

    const resultKey = `generations/${input.userId}/${generationId}/result.png`;
    const storage = await getStorage();
    const uploaded = await storage.upload(
      generated.buffer,
      resultKey,
      "image/png",
    );

    await db.generation.update({
      where: { id: generationId },
      data: {
        status: "EVALUATING",
        resultKey: uploaded.key,
        resultUrl: uploaded.url,
      },
    });

    const evaluation = await evaluateOutput(
      generated.buffer.toString("base64"),
      "image/png",
      optimizedPrompt,
    );

    await db.generation.update({
      where: { id: generationId },
      data: {
        status: "COMPLETED",
        qualityScore: evaluation.quality,
        detailScore: evaluation.detail,
        compositionScore: evaluation.composition,
        commercialScore: evaluation.commercial,
        evaluationJson: JSON.parse(JSON.stringify(evaluation)),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Transformation failed";
    await db.generation.update({
      where: { id: generationId },
      data: {
        status: "FAILED",
        errorMessage: message,
      },
    });
    throw error;
  }
}
