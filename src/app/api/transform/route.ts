import { after, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  executeTransformPipeline,
  generateTransformAction,
} from "@/actions/transform";
import { getCreditCost } from "@/lib/credits";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 300;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await rateLimit(`transform:${session.user.id}`, 10, "1 m");
  if (!limit.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await request.json();
  const { generationId, style, mode } = body as {
    generationId: string;
    style: string;
    mode?: "STANDARD" | "HD" | "BATCH";
  };

  const resolvedMode = mode ?? "STANDARD";
  const result = await generateTransformAction(
    generationId,
    style as Parameters<typeof generateTransformAction>[1],
    resolvedMode,
  );

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const newId = result.generationId!;
  const cost = getCreditCost(resolvedMode);

  after(async () => {
    await executeTransformPipeline(
      newId,
      session.user!.id!,
      style as Parameters<typeof executeTransformPipeline>[2],
      resolvedMode,
      cost,
    );
  });

  return NextResponse.json({
    generationId: newId,
    status: "GENERATING",
  });
}
