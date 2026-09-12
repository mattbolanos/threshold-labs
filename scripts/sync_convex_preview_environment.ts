import { spawnSync } from "node:child_process";

export const STRIPE_PREVIEW_BRANCH = "stripe";

const REQUIRED_SOURCE_VARIABLES = [
  "AUTH_EMAIL_FROM",
  "BETTER_AUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "RESEND_API_KEY",
  "STRIPE_INSIDE_LAB_PRICE_ID",
  "STRIPE_SECRET_KEY",
  "STRIPE_TRAINING_BLOCK_BUNDLE_PRICE_ID",
  "STRIPE_TRAINING_BLOCK_PRICE_ID",
  "STRIPE_WEBHOOK_SECRET",
] as const;

type Environment = Record<string, string | undefined>;

export type ConvexPreviewEnvironment = Record<
  | (typeof REQUIRED_SOURCE_VARIABLES)[number]
  | "PREVIEW_AUTH_BYPASS"
  | "SITE_URL"
  | "VERCEL_ENV",
  string
>;

export const getConvexPreviewName = (environment: Environment) =>
  environment.CONVEX_PREVIEW_NAME ??
  environment.VERCEL_GIT_COMMIT_REF ??
  environment.GITHUB_HEAD_REF ??
  environment.GITHUB_REF_NAME;

export const shouldSyncStripePreviewEnvironment = (environment: Environment) =>
  environment.VERCEL_ENV === "preview" &&
  getConvexPreviewName(environment) === STRIPE_PREVIEW_BRANCH;

export const shouldSeedConvexPreview = (environment: Environment) => {
  if (environment.VERCEL_ENV !== "preview") return false;

  const override = environment.CONVEX_SEED_PREVIEW;
  if (override !== undefined && override !== "true" && override !== "false") {
    throw new Error('CONVEX_SEED_PREVIEW must be either "true" or "false".');
  }

  // Billing records refer to seed document IDs. Keep the long-lived Stripe
  // preview stable across deploys; disposable previews can still be reseeded.
  return override !== undefined
    ? override === "true"
    : getConvexPreviewName(environment) !== STRIPE_PREVIEW_BRANCH;
};

const requireSourceVariables = (environment: Environment) => {
  const missing = REQUIRED_SOURCE_VARIABLES.filter(
    (name) => !environment[name]?.trim(),
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing Vercel Preview environment variables required by Convex: ${missing.join(", ")}.`,
    );
  }

  const variables = Object.fromEntries(
    REQUIRED_SOURCE_VARIABLES.map((name) => [
      name,
      (environment[name] as string).trim(),
    ]),
  ) as Pick<
    ConvexPreviewEnvironment,
    (typeof REQUIRED_SOURCE_VARIABLES)[number]
  >;

  for (const name of [
    "STRIPE_INSIDE_LAB_PRICE_ID",
    "STRIPE_TRAINING_BLOCK_PRICE_ID",
    "STRIPE_TRAINING_BLOCK_BUNDLE_PRICE_ID",
  ] as const) {
    if (!/^price_[A-Za-z0-9]+$/.test(variables[name])) {
      throw new Error(
        `${name} must contain only a Stripe price ID (price_...).`,
      );
    }
  }

  return variables;
};

const normalizeUrl = (value: string) =>
  value.startsWith("https://") || value.startsWith("http://")
    ? value
    : `https://${value}`;

export const getVercelPreviewSiteUrl = (environment: Environment) => {
  const value = environment.VERCEL_BRANCH_URL ?? environment.VERCEL_URL;

  if (!value) {
    throw new Error(
      "Missing VERCEL_BRANCH_URL or VERCEL_URL for the stripe preview SITE_URL.",
    );
  }

  const url = new URL(normalizeUrl(value));

  if (url.protocol !== "https:") {
    throw new Error("The stripe preview SITE_URL must use HTTPS.");
  }

  return url.origin;
};

export const buildConvexPreviewEnvironment = (
  environment: Environment,
): ConvexPreviewEnvironment => {
  const sourceVariables = requireSourceVariables(environment);
  const previewAuthBypass = environment.PREVIEW_AUTH_BYPASS ?? "true";

  if (previewAuthBypass !== "true" && previewAuthBypass !== "false") {
    throw new Error('PREVIEW_AUTH_BYPASS must be either "true" or "false".');
  }

  if (sourceVariables.STRIPE_SECRET_KEY.includes("_live_")) {
    throw new Error(
      "Refusing to copy a live Stripe secret key into the stripe preview deployment.",
    );
  }

  return {
    ...sourceVariables,
    PREVIEW_AUTH_BYPASS: previewAuthBypass,
    SITE_URL: getVercelPreviewSiteUrl(environment),
    VERCEL_ENV: "preview",
  };
};

export const serializeEnvironment = (environment: Record<string, string>) =>
  `${Object.entries(environment)
    .map(([name, value]) => `${name}=${JSON.stringify(value)}`)
    .join("\n")}\n`;

export const syncConvexPreviewEnvironment = (
  environment: Environment = process.env,
) => {
  if (environment.VERCEL_ENV !== "preview") {
    process.stdout.write(
      "Skipping Convex environment sync outside Vercel previews.\n",
    );
    return;
  }

  if (!environment.CONVEX_DEPLOY_KEY?.startsWith("preview:")) {
    throw new Error(
      "CONVEX_DEPLOY_KEY must be a Convex preview deploy key before syncing preview environment variables.",
    );
  }

  const previewName = getConvexPreviewName(environment);
  if (!previewName) {
    throw new Error("Missing Convex preview name.");
  }
  const previewEnvironment = shouldSyncStripePreviewEnvironment(environment)
    ? buildConvexPreviewEnvironment(environment)
    : { VERCEL_ENV: "preview" };
  const result = spawnSync(
    "bunx",
    [
      "convex",
      "env",
      "set",
      "--force",
      "--preview-name",
      previewName as string,
    ],
    {
      env: { ...process.env, ...environment },
      input: serializeEnvironment(previewEnvironment),
      stdio: ["pipe", "inherit", "inherit"],
    },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `Convex preview environment sync failed with status ${result.status ?? "unknown"}.`,
    );
  }

  process.stdout.write(
    `Synced Convex environment variables for the ${previewName} preview.\n`,
  );
};

if (import.meta.main) {
  syncConvexPreviewEnvironment();
}
