import "server-only";

import type { StorageProvider, UploadResult } from "@/lib/storage/types";

export type { StorageProvider, UploadResult };

let storageInstance: StorageProvider | null = null;

export async function getStorage(): Promise<StorageProvider> {
  if (storageInstance) return storageInstance;

  const driver = process.env.STORAGE_DRIVER ?? "local";
  if (driver === "r2") {
    const { R2StorageProvider } = await import("@/lib/storage/r2");
    storageInstance = new R2StorageProvider();
  } else {
    const { LocalStorageProvider } = await import("@/lib/storage/local");
    storageInstance = new LocalStorageProvider();
  }

  return storageInstance;
}
