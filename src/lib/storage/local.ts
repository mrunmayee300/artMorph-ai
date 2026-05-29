import { mkdir, writeFile, unlink, access } from "fs/promises";
import path from "path";
import { env } from "@/lib/env";
import type { StorageProvider, UploadResult } from "@/lib/storage/types";

export class LocalStorageProvider implements StorageProvider {
  private basePath: string;

  constructor() {
    const localPath =
      process.env.STORAGE_LOCAL_PATH ?? env.STORAGE_LOCAL_PATH ?? "./storage";
    this.basePath = path.resolve(process.cwd(), localPath);
  }

  private resolvePath(key: string): string {
    const safeKey = key.replace(/\.\./g, "").replace(/^\/+/, "");
    return path.join(this.basePath, safeKey);
  }

  async upload(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<UploadResult> {
    const filePath = this.resolvePath(key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);
    return {
      key,
      url: this.getPublicUrl(key),
      size: buffer.length,
      contentType,
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolvePath(key);
    try {
      await access(filePath);
      await unlink(filePath);
    } catch {
      return;
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    return this.getPublicUrl(key);
  }

  getPublicUrl(key: string): string {
    const encoded = key
      .replace(/^\/+/, "")
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `/api/files/${encoded}`;
  }
}
