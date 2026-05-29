import { NextResponse } from "next/server";
import { readFile, access } from "fs/promises";
import path from "path";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  if ((process.env.STORAGE_DRIVER ?? "local") !== "local") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { key: keyParts } = await params;
  const key = decodeURIComponent(keyParts.join("/"));
  const safeKey = key.replace(/\.\./g, "");
  const filePath = path.resolve(
    process.cwd(),
    process.env.STORAGE_LOCAL_PATH ?? "./storage",
    safeKey,
  );

  try {
    await access(filePath);
    const buffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".webp"
            ? "image/webp"
            : "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
