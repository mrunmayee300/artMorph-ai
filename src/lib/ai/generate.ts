import type { GenerationMode } from "@prisma/client";
import sharp from "sharp";
import type { ImageModel } from "openai/resources/images";
import { openai } from "@/lib/openai";

export interface GeneratedImage {
  buffer: Buffer;
  revisedPrompt?: string;
}

const DEFAULT_IMAGE_MODEL: ImageModel = "gpt-image-1";

function getImageModel(): ImageModel {
  const fromEnv = process.env.OPENAI_IMAGE_MODEL?.trim();
  return (fromEnv as ImageModel) || DEFAULT_IMAGE_MODEL;
}

function toImageQuality(mode: GenerationMode): "low" | "medium" | "high" {
  if (mode === "HD" || mode === "BATCH") return "high";
  return "medium";
}

export async function generateTransformedImage(
  prompt: string,
  sourceImageBuffer: Buffer,
  mimeType: string,
  mode: GenerationMode,
): Promise<GeneratedImage> {
  const model = getImageModel();
  const quality = toImageQuality(mode);
  const prepared = await prepareImageForEdit(sourceImageBuffer);
  const imageFile = new File(
    [new Uint8Array(prepared)],
    "source.png",
    { type: "image/png" },
  );

  try {
    const edited = await openai.images.edit({
      model,
      image: imageFile,
      prompt,
      size: "1024x1024",
      quality,
      input_fidelity: mode === "HD" ? "high" : "low",
      n: 1,
    });

    const buffer = await extractImageBuffer(edited.data?.[0]);
    return { buffer, revisedPrompt: edited.data?.[0]?.revised_prompt };
  } catch (editError) {
    const fallbackPrompt = `${prompt}. Preserve the core composition and subject matter of the original ${mimeType} input while elevating visual quality.`;
    const generated = await openai.images.generate({
      model,
      prompt: fallbackPrompt,
      size: "1024x1024",
      quality,
      n: 1,
    });

    const buffer = await extractImageBuffer(generated.data?.[0]);
    if (!buffer) {
      const message =
        editError instanceof Error ? editError.message : "Image edit failed";
      throw new Error(message);
    }
    return { buffer, revisedPrompt: generated.data?.[0]?.revised_prompt };
  }
}

async function prepareImageForEdit(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer, { failOn: "none" })
    .rotate()
    .resize(1024, 1024, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();
}

async function extractImageBuffer(
  imageData?: { b64_json?: string | null; url?: string | null },
): Promise<Buffer> {
  if (imageData?.b64_json) {
    return Buffer.from(imageData.b64_json, "base64");
  }
  if (imageData?.url) {
    const response = await fetch(imageData.url);
    if (!response.ok) {
      throw new Error("Failed to download generated image");
    }
    return Buffer.from(await response.arrayBuffer());
  }
  throw new Error("Image generation failed: no output returned");
}
