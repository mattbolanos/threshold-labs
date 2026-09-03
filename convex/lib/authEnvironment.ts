import type { GenericCtx } from "@convex-dev/better-auth";
import type { DataModel } from "../_generated/dataModel";

const AUTH_ENVIRONMENT = {
  AUTH_EMAIL_FROM: {
    runtime: () => process.env.AUTH_EMAIL_FROM,
    schemaGeneration: "Threshold Lab <account@example.com>",
  },
  BETTER_AUTH_SECRET: {
    runtime: () => process.env.BETTER_AUTH_SECRET,
    schemaGeneration: "schema-generation-secret-at-least-32-characters",
  },
  GOOGLE_CLIENT_ID: {
    runtime: () => process.env.GOOGLE_CLIENT_ID,
    schemaGeneration: "google-schema-generation-client-id",
  },
  GOOGLE_CLIENT_SECRET: {
    runtime: () => process.env.GOOGLE_CLIENT_SECRET,
    schemaGeneration: "google-schema-generation-client-secret",
  },
  RESEND_API_KEY: {
    runtime: () => process.env.RESEND_API_KEY,
    schemaGeneration: "re_schema_generation_key",
  },
  SITE_URL: {
    runtime: () => process.env.SITE_URL,
    schemaGeneration: "http://localhost:3000",
  },
  STRIPE_INSIDE_LAB_PRICE_ID: {
    runtime: () => process.env.STRIPE_INSIDE_LAB_PRICE_ID,
    schemaGeneration: "price_schema_generation_inside_lab",
  },
  STRIPE_SECRET_KEY: {
    runtime: () => process.env.STRIPE_SECRET_KEY,
    schemaGeneration: "stripe-schema-generation-key",
  },
  STRIPE_TRAINING_ARCHIVE_PRICE_ID: {
    runtime: () => process.env.STRIPE_TRAINING_ARCHIVE_PRICE_ID,
    schemaGeneration: "price_schema_generation_training_archive",
  },
  STRIPE_WEBHOOK_SECRET: {
    runtime: () => process.env.STRIPE_WEBHOOK_SECRET,
    schemaGeneration: "stripe-schema-generation-webhook-secret",
  },
} as const;

type AuthEnvironmentName = keyof typeof AUTH_ENVIRONMENT;

function isConvexRuntimeContext(ctx: GenericCtx<DataModel>) {
  return "runQuery" in ctx;
}

export function getAuthEnvironment(
  ctx: GenericCtx<DataModel>,
  name: AuthEnvironmentName,
) {
  const environment = AUTH_ENVIRONMENT[name];
  const value = environment.runtime();

  if (value) {
    return value;
  }

  // Better Auth and the local Convex component inspect these options with an
  // empty context while generating/building the schema. No external request is
  // made in that path, so deterministic non-secret values are sufficient.
  if (!isConvexRuntimeContext(ctx)) {
    return environment.schemaGeneration;
  }

  throw new Error(`Missing ${name} in the Convex deployment environment.`);
}
