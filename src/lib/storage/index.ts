import { LocalStorageProvider } from "@/lib/storage/local";
import { R2StorageProvider } from "@/lib/storage/r2";
import type { StorageProvider, UploadResult } from "@/lib/storage/types";

export type { StorageProvider, UploadResult };

function createStorageProvider(): StorageProvider {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  if (driver === "r2") {
    return new R2StorageProvider();
  }
  return new LocalStorageProvider();
}

export const storage = createStorageProvider();
