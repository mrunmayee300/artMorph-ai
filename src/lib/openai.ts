import OpenAI from "openai";
import { env } from "@/lib/env";

let openaiClient: OpenAI | undefined;

export function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = env.OPENAI_API_KEY ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}
