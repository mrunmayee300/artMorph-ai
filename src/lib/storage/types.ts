export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export interface StorageProvider {
  upload(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  getPublicUrl(key: string): string;
}
