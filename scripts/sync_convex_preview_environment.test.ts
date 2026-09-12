import { describe, expect, spyOn, test } from "bun:test";
import * as childProcess from "node:child_process";
import {
  buildConvexPreviewEnvironment,
  getVercelPreviewSiteUrl,
  serializeEnvironment,
  shouldSyncStripePreviewEnvironment,
  syncConvexPreviewEnvironment,
} from "./sync_convex_preview_environment";

const validEnvironment = {
  AUTH_EMAIL_FROM: "Threshold Lab <accounts@example.com>",
  BETTER_AUTH_SECRET: "preview-secret-at-least-32-characters",
  CONVEX_DEPLOY_KEY: "preview:team:project|secret",
  GOOGLE_CLIENT_ID: "google-client-id",
  GOOGLE_CLIENT_SECRET: "google-client-secret",
  PREVIEW_AUTH_BYPASS: "true",
  RESEND_API_KEY: "re_preview",
  STRIPE_INSIDE_LAB_PRICE_ID: "price_membership",
  STRIPE_SECRET_KEY: "sk_test_preview",
  STRIPE_TRAINING_BLOCK_BUNDLE_PRICE_ID: "price_block_bundle",
  STRIPE_TRAINING_BLOCK_PRICE_ID: "price_block",
  STRIPE_WEBHOOK_SECRET: "whsec_preview",
  VERCEL_BRANCH_URL: "threshold-labs-git-stripe.vercel.app",
  VERCEL_ENV: "preview",
  VERCEL_GIT_COMMIT_REF: "stripe",
};

describe("stripe Convex preview environment", () => {
  test("syncs only the stripe Vercel preview", () => {
    expect(shouldSyncStripePreviewEnvironment(validEnvironment)).toBe(true);
    expect(
      shouldSyncStripePreviewEnvironment({
        ...validEnvironment,
        VERCEL_GIT_COMMIT_REF: "another-branch",
      }),
    ).toBe(false);
    expect(
      shouldSyncStripePreviewEnvironment({
        ...validEnvironment,
        VERCEL_ENV: "production",
      }),
    ).toBe(false);
  });

  test("uses the stable branch URL for SITE_URL", () => {
    expect(getVercelPreviewSiteUrl(validEnvironment)).toBe(
      "https://threshold-labs-git-stripe.vercel.app",
    );
    expect(
      getVercelPreviewSiteUrl({
        ...validEnvironment,
        VERCEL_BRANCH_URL: undefined,
        VERCEL_URL: "threshold-labs-commit.vercel.app",
      }),
    ).toBe("https://threshold-labs-commit.vercel.app");
  });

  test("builds the complete Convex environment", () => {
    expect(buildConvexPreviewEnvironment(validEnvironment)).toEqual({
      AUTH_EMAIL_FROM: validEnvironment.AUTH_EMAIL_FROM,
      BETTER_AUTH_SECRET: validEnvironment.BETTER_AUTH_SECRET,
      GOOGLE_CLIENT_ID: validEnvironment.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: validEnvironment.GOOGLE_CLIENT_SECRET,
      PREVIEW_AUTH_BYPASS: "true",
      RESEND_API_KEY: validEnvironment.RESEND_API_KEY,
      SITE_URL: "https://threshold-labs-git-stripe.vercel.app",
      STRIPE_INSIDE_LAB_PRICE_ID: validEnvironment.STRIPE_INSIDE_LAB_PRICE_ID,
      STRIPE_SECRET_KEY: validEnvironment.STRIPE_SECRET_KEY,
      STRIPE_TRAINING_BLOCK_BUNDLE_PRICE_ID:
        validEnvironment.STRIPE_TRAINING_BLOCK_BUNDLE_PRICE_ID,
      STRIPE_TRAINING_BLOCK_PRICE_ID:
        validEnvironment.STRIPE_TRAINING_BLOCK_PRICE_ID,
      STRIPE_WEBHOOK_SECRET: validEnvironment.STRIPE_WEBHOOK_SECRET,
      VERCEL_ENV: "preview",
    });
  });

  test("preserves real login when the preview auth bypass is disabled", () => {
    expect(
      buildConvexPreviewEnvironment({
        ...validEnvironment,
        PREVIEW_AUTH_BYPASS: "false",
      }),
    ).toMatchObject({ PREVIEW_AUTH_BYPASS: "false", VERCEL_ENV: "preview" });
  });

  test("syncs the preview marker on other branches without copying Stripe secrets", () => {
    const spawn = spyOn(childProcess, "spawnSync").mockReturnValue({
      status: 0,
    } as ReturnType<typeof childProcess.spawnSync>);
    try {
      syncConvexPreviewEnvironment({
        CONVEX_DEPLOY_KEY: validEnvironment.CONVEX_DEPLOY_KEY,
        VERCEL_ENV: "preview",
        VERCEL_GIT_COMMIT_REF: "feature-branch",
      });
      expect(spawn).toHaveBeenCalledTimes(1);
      const [command, args, options] = spawn.mock.calls[0];
      expect(command).toBe("bunx");
      expect(args).toEqual([
        "convex",
        "env",
        "set",
        "--force",
        "--preview-name",
        "feature-branch",
      ]);
      expect(options?.input).toBe('VERCEL_ENV="preview"\n');
    } finally {
      spawn.mockRestore();
    }
  });

  test("never syncs outside previews or with a non-preview deploy key", () => {
    const spawn = spyOn(childProcess, "spawnSync");
    try {
      for (const VERCEL_ENV of ["production", "development", undefined]) {
        syncConvexPreviewEnvironment({ ...validEnvironment, VERCEL_ENV });
      }
      expect(() =>
        syncConvexPreviewEnvironment({
          ...validEnvironment,
          CONVEX_DEPLOY_KEY: "prod:team:project|secret",
        }),
      ).toThrow("preview deploy key");
      expect(() =>
        syncConvexPreviewEnvironment({
          CONVEX_DEPLOY_KEY: validEnvironment.CONVEX_DEPLOY_KEY,
          VERCEL_ENV: "preview",
        }),
      ).toThrow("Missing Convex preview name");
      expect(spawn).not.toHaveBeenCalled();
    } finally {
      spawn.mockRestore();
    }
  });

  test("fails when a required source variable is missing", () => {
    expect(() =>
      buildConvexPreviewEnvironment({
        ...validEnvironment,
        RESEND_API_KEY: undefined,
      }),
    ).toThrow("RESEND_API_KEY");
  });

  test("refuses live Stripe credentials", () => {
    expect(() =>
      buildConvexPreviewEnvironment({
        ...validEnvironment,
        STRIPE_SECRET_KEY: "sk_live_do_not_copy",
      }),
    ).toThrow("live Stripe secret key");
  });

  test("serializes values without exposing dotenv syntax", () => {
    expect(
      serializeEnvironment({
        AUTH_EMAIL_FROM: "Threshold Lab <accounts@example.com>",
        SECRET: "value with spaces and # punctuation",
      }),
    ).toBe(
      'AUTH_EMAIL_FROM="Threshold Lab <accounts@example.com>"\nSECRET="value with spaces and # punctuation"\n',
    );
  });
});
