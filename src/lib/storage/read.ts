import { readFile } from "fs/promises";
import path from "path";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

export async function readStoredFile(key: string): Promise<Buffer> {
  const safeKey = key.replace(/\.\./g, "").replace(/^\/+/, "");
  const driver = process.env.STORAGE_DRIVER ?? env.STORAGE_DRIVER ?? "local";

  if (driver === "r2") {
    if (
      !env.R2_ACCOUNT_ID ||
      !env.R2_ACCESS_KEY_ID ||
      !env.R2_SECRET_ACCESS_KEY ||
      !env.R2_BUCKET_NAME
    ) {
      throw new Error("R2 storage is not configured");
    }
    const { S3Client } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
    const response = await client.send(
      new GetObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: safeKey,
      }),
    );
    const bytes = await response.Body?.transformToByteArray();
    if (!bytes) throw new Error("Failed to read file from storage");
    return Buffer.from(bytes);
  }

  const basePath = path.resolve(
    process.cwd(),
    process.env.STORAGE_LOCAL_PATH ?? env.STORAGE_LOCAL_PATH ?? "./storage",
  );
  return readFile(path.join(basePath, safeKey));
}
