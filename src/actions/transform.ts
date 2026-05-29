"use server";

import { revalidatePath } from "next/cache";
import type { StylePreset } from "@prisma/client";
import { auth } from "@/lib/auth";
import { runTransformationPipeline } from "@/lib/ai/pipeline";
import { trackEvent } from "@/lib/analytics";
import { getCreditCost, deductCredits, hasEnoughCredits } from "@/lib/credits";
import { db } from "@/lib/db";
import { readStoredFile } from "@/lib/storage/read";
import { transformSchema } from "@/lib/validations";

export type ActionState = {
  error?: string;
  success?: boolean;
  generationId?: string;
};

export async function generateTransformAction(
  generationId: string,
  style: StylePreset,
  mode: "STANDARD" | "HD" | "BATCH" = "STANDARD",
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const userId = session.user.id;

  const parsed = transformSchema.safeParse({ generationId, style, mode });
  if (!parsed.success) return { error: "Invalid parameters" };

  const generation = await db.generation.findFirst({
    where: { id: generationId, userId },
  });
  if (!generation) return { error: "Generation not found" };

  const rootId = generation.parentId ?? generation.id;
  const root = await db.generation.findFirst({
    where: { id: rootId, userId },
  });
  if (!root) return { error: "Generation not found" };

  const latestInChain = await db.generation.findFirst({
    where: {
      userId,
      OR: [{ id: rootId }, { parentId: rootId }],
    },
    orderBy: { version: "desc" },
  });

  const cost = getCreditCost(mode);
  if (!(await hasEnoughCredits(userId, mode))) {
    return { error: "Insufficient credits" };
  }

  await deductCredits(
    userId,
    cost,
    `Transform generation (${mode})`,
    { generationId: rootId, style, mode },
  );

  const newVersion = await db.generation.create({
    data: {
      userId,
      projectId: root.projectId,
      parentId: rootId,
      version: (latestInChain?.version ?? 1) + 1,
      status: "GENERATING",
      mode,
      style,
      originalKey: root.originalKey,
      originalUrl: root.originalUrl,
      creditCost: cost,
    },
  });

  return { success: true, generationId: newVersion.id };
}

export async function executeTransformPipeline(
  generationId: string,
  userId: string,
  style: StylePreset,
  mode: "STANDARD" | "HD" | "BATCH",
  creditCost: number,
): Promise<void> {
  const generation = await db.generation.findFirst({
    where: { id: generationId, userId },
  });
  if (!generation?.originalKey) return;

  try {
    const buffer = await readStoredFile(generation.originalKey);

    await runTransformationPipeline({
      generationId,
      userId,
      imageBuffer: buffer,
      mimeType: "image/png",
      style,
      mode,
    });

    await trackEvent(
      "generation_completed",
      { style, mode, generationId },
      userId,
    );

    revalidatePath("/dashboard/transform");
    revalidatePath("/dashboard/history");
  } catch (error) {
    await grantRefund(userId, creditCost, generationId);
    const message =
      error instanceof Error ? error.message : "Generation failed";
    const current = await db.generation.findFirst({
      where: { id: generationId },
      select: { status: true },
    });
    if (current?.status !== "FAILED") {
      await db.generation.update({
        where: { id: generationId },
        data: { status: "FAILED", errorMessage: message },
      });
    }
  }
}

async function grantRefund(
  userId: string,
  amount: number,
  generationId: string,
): Promise<void> {
  const { grantCredits } = await import("@/lib/credits");
  await grantCredits(
    userId,
    amount,
    "REFUND",
    "Generation failed - credit refund",
    { generationId },
  );
}

export async function analyzeUploadAction(
  generationId: string,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const generation = await db.generation.findFirst({
    where: { id: generationId, userId: session.user.id },
  });
  if (!generation) return { error: "Not found" };

  const { runAnalysisOnly } = await import("@/lib/ai/pipeline");
  const buffer = await readStoredFile(generation.originalKey);
  const base64 = buffer.toString("base64");

  await runAnalysisOnly(generationId, base64, "image/png");
  revalidatePath("/dashboard/transform");
  return { success: true };
}
