import "server-only";

import { readFile } from "fs/promises";
import path from "path";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function readStoredFile(key: string): Promise<Buffer> {
  const safeKey = key.replace(/\.\./g, "").replace(/^\/+/, "");
  const driver = process.env.STORAGE_DRIVER ?? "local";

  if (driver === "r2") {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME;
    if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error("R2 storage is not configured");
    }
    const { S3Client } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: safeKey,
      }),
    );
    const bytes = await response.Body?.transformToByteArray();
    if (!bytes) throw new Error("Failed to read file from storage");
    return Buffer.from(bytes);
  }

  const segments = safeKey.split("/").filter(Boolean);
  return readFile(path.join(process.cwd(), "storage", ...segments));
}
