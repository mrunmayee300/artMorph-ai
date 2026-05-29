import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

function parseEnvFile(filePath: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!existsSync(filePath)) return out;

  const content = readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const OPENAI_PLACEHOLDERS = ["sk-test", "sk-your-openai-api-key", ""];

function isOpenAIPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  return OPENAI_PLACEHOLDERS.some(
    (p) => p === value || value.startsWith(p),
  );
}

/**
 * Next.js does not override variables already present in the shell.
 * Cursor and other tools often inject OPENAI_API_KEY=sk-test, which breaks local dev.
 */
export function applyEnvFileOverrides(): void {
  const cwd = process.cwd();
  const fromFiles = {
    ...parseEnvFile(resolve(cwd, ".env")),
    ...parseEnvFile(resolve(cwd, ".env.local")),
  };

  const fileKey = fromFiles.OPENAI_API_KEY;
  if (!fileKey) return;

  if (process.env.NODE_ENV !== "production") {
    process.env.OPENAI_API_KEY = fileKey;
    return;
  }

  if (isOpenAIPlaceholder(process.env.OPENAI_API_KEY)) {
    process.env.OPENAI_API_KEY = fileKey;
  }
}
