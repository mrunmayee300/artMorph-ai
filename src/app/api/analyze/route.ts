import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeUploadAction } from "@/actions/transform";

export const maxDuration = 120;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { generationId } = await request.json();
  if (!generationId) {
    return NextResponse.json({ error: "Missing generationId" }, { status: 400 });
  }

  const result = await analyzeUploadAction(generationId);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
