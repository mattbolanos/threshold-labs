import { PostHog } from "posthog-node";

export function PostHogClient() {
  const posthogClient = new PostHog(
    process.env.NEXT_PUBLIC_POSTHOG_KEY as string,
    {
      flushAt: 1,
      flushInterval: 0,
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    },
  );
  return posthogClient;
}
