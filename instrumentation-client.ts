import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
  api_host: "/ingest",
  capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
  debug: process.env.NODE_ENV === "development",
  defaults: "2025-11-30",
  ui_host: "https://us.posthog.com",
});
