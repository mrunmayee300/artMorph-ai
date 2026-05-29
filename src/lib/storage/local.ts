import "server-only";

import { mkdir, writeFile, unlink, access } from "fs/promises";
import path from "path";
import type { StorageProvider, UploadResult } from "@/lib/storage/types";

export class LocalStorageProvider implements StorageProvider {
  private basePath: string;

  constructor() {
    this.basePath = path.join(process.cwd(), "storage");
  }

  private resolvePath(key: string): string {
    const safeKey = key.replace(/\.\./g, "").replace(/^\/+/, "");
    const segments = safeKey.split("/").filter(Boolean);
    return path.join(this.basePath, ...segments);
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
