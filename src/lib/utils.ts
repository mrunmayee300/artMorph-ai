import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCredits(amount: number): string {
  return new Intl.NumberFormat().format(amount);
}

export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Use same-origin paths for stored files so dev port changes do not break images. */
export function normalizeMediaUrl(url: string): string {
  if (!url || url === "pending") return url;
  try {
    const parsed = new URL(url, "http://localhost");
    if (parsed.pathname.startsWith("/api/files/")) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    return url;
  }
  return url;
}
