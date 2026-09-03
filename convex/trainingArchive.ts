import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { getAuthEnvironment } from "./lib/authEnvironment";
import {
  createStripeClient,
  getStripeCheckoutBrandingSettings,
} from "./lib/stripeAuth";
import {
  TRAINING_ARCHIVE_CURRENCY,
  TRAINING_ARCHIVE_PRICE_CENTS,
  TRAINING_ARCHIVE_PRODUCT_KEY,
  TRAINING_ARCHIVE_TITLE,
  TRAINING_ARCHIVE_WINDOW,
} from "./lib/trainingArchive";
import { getVerifiedTrainingArchivePurchase } from "./lib/trainingArchiveStripe";

export const getPurchaseForReference = internalQuery({
  args: { referenceId: v.string() },
  handler: async (ctx, { referenceId }) =>
    await ctx.db
      .query("trainingArchivePurchases")
      .withIndex("by_reference_id", (q) => q.eq("referenceId", referenceId))
      .first(),
});

export const grantPurchase = internalMutation({
  args: {
    purchasedAt: v.number(),
    referenceId: v.string(),
    stripeCheckoutSessionId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, purchase) => {
    const existingSession = await ctx.db
      .query("trainingArchivePurchases")
      .withIndex("by_stripe_checkout_session", (q) =>
        q.eq("stripeCheckoutSessionId", purchase.stripeCheckoutSessionId),
      )
      .first();

    if (existingSession) {
      return existingSession._id;
    }

    const existingPurchase = await ctx.db
      .query("trainingArchivePurchases")
      .withIndex("by_reference_id", (q) =>
        q.eq("referenceId", purchase.referenceId),
      )
      .first();

    if (existingPurchase) {
      return existingPurchase._id;
    }

    return await ctx.db.insert("trainingArchivePurchases", {
      ...purchase,
      accessEnd: TRAINING_ARCHIVE_WINDOW.to,
      accessStart: TRAINING_ARCHIVE_WINDOW.from,
      status: "active",
    });
  },
});

export const createCheckout = action({
  args: {
    surface: v.optional(v.union(v.literal("pricing"), v.literal("subscribe"))),
  },
  handler: async (ctx, { surface }): Promise<{ url: string }> => {
    const user = await ctx.runQuery(
      internal.auth.getCurrentStripeCheckoutUser,
      {},
    );

    if (!user) {
      throw new ConvexError("Sign in before opening checkout.");
    }

    const siteUrl = getAuthEnvironment(ctx, "SITE_URL");
    const existingPurchase = await ctx.runQuery(
      internal.trainingArchive.getPurchaseForReference,
      { referenceId: user.referenceId },
    );

    if (existingPurchase?.status === "active") {
      return {
        url: new URL("/lab/training/workouts", siteUrl).toString(),
      };
    }

    const stripeClient = createStripeClient(ctx);
    const priceId = getAuthEnvironment(ctx, "STRIPE_TRAINING_ARCHIVE_PRICE_ID");
    const metadata = {
      purchaseType: TRAINING_ARCHIVE_PRODUCT_KEY,
      referenceId: user.referenceId,
    };
    const cancelPath =
      surface === "pricing"
        ? "/lab/pricing?checkout=archive-cancelled"
        : "/subscribe?checkout=archive-cancelled";
    const checkoutSession = await stripeClient.checkout.sessions.create({
      branding_settings: getStripeCheckoutBrandingSettings(siteUrl),
      cancel_url: new URL(cancelPath, siteUrl).toString(),
      client_reference_id: user.referenceId,
      ...(user.stripeCustomerId
        ? { customer: user.stripeCustomerId }
        : {
            customer_creation: "always" as const,
            customer_email: user.email,
          }),
      line_items: [{ price: priceId, quantity: 1 }],
      metadata,
      mode: "payment",
      payment_intent_data: { metadata },
      submit_type: "pay",
      success_url: new URL(
        "/auth/training-archive/success?session_id={CHECKOUT_SESSION_ID}",
        siteUrl,
      ).toString(),
    });

    if (!checkoutSession.url) {
      throw new ConvexError("Stripe checkout could not be opened.");
    }

    return { url: checkoutSession.url };
  },
});

export const confirmCheckout = action({
  args: { checkoutSessionId: v.string() },
  handler: async (ctx, { checkoutSessionId }): Promise<boolean> => {
    const user = await ctx.runQuery(
      internal.auth.getCurrentStripeCheckoutUser,
      {},
    );

    if (!user) {
      throw new ConvexError("Sign in to confirm this purchase.");
    }

    const purchase = await getVerifiedTrainingArchivePurchase({
      checkoutSessionId,
      ctx,
      expectedReferenceId: user.referenceId,
      stripeClient: createStripeClient(ctx),
    });

    if (!purchase) {
      return false;
    }

    await ctx.runMutation(internal.trainingArchive.grantPurchase, purchase);
    return true;
  },
});

export const trainingArchiveProduct = {
  accessEnd: TRAINING_ARCHIVE_WINDOW.to,
  accessStart: TRAINING_ARCHIVE_WINDOW.from,
  currency: TRAINING_ARCHIVE_CURRENCY,
  price: TRAINING_ARCHIVE_PRICE_CENTS,
  title: TRAINING_ARCHIVE_TITLE,
};
