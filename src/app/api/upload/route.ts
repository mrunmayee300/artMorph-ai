import { NextResponse } from "next/server";
import sharp from "sharp";
import { auth } from "@/lib/auth";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE } from "@/lib/constants";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getStorage } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await rateLimit(`upload:${session.user.id}`, 20, "1 m");
  if (!limit.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const projectId = formData.get("projectId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const processed = await sharp(buffer)
    .rotate()
    .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();

  const generation = await db.generation.create({
    data: {
      userId: session.user.id,
      projectId: projectId || undefined,
      status: "PENDING",
      originalKey: "pending",
      originalUrl: "pending",
      version: 1,
    },
  });

  const key = `uploads/${session.user.id}/${generation.id}/original.png`;
  const storage = await getStorage();
  const uploaded = await storage.upload(processed, key, "image/png");

  await db.generation.update({
    where: { id: generation.id },
    data: {
      originalKey: uploaded.key,
      originalUrl: uploaded.url,
    },
  });

  await trackEvent("image_uploaded", { generationId: generation.id }, session.user.id);

  return NextResponse.json({
    generationId: generation.id,
    originalUrl: uploaded.url,
  });
}
