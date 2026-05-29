import { PostHog } from "posthog-node";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

let posthog: PostHog | null = null;

function getPostHog(): PostHog | null {
  if (!env.POSTHOG_API_KEY) return null;
  if (!posthog) {
    posthog = new PostHog(env.POSTHOG_API_KEY, {
      host: env.NEXT_PUBLIC_POSTHOG_HOST,
    });
  }
  return posthog;
}

export async function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
  userId?: string,
): Promise<void> {
  await db.analyticsEvent.create({
    data: {
      event,
      properties: properties
        ? JSON.parse(JSON.stringify(properties))
        : undefined,
      userId,
    },
  });

  const client = getPostHog();
  if (client && userId) {
    client.capture({
      distinctId: userId,
      event,
      properties,
    });
  }
}
