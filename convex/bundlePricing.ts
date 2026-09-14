import { ConvexError, v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  type QueryCtx,
  query,
} from "./_generated/server";
import { assertAdmin } from "./auth";
import { getAuthEnvironment } from "./lib/authEnvironment";
import { type BundlePrice, validateBundleAmount } from "./lib/bundlePricing";
import { TRAINING_BLOCK_BUNDLE_PRICE_CENTS } from "./lib/trainingBlockPurchases";

async function currentPrice(ctx: QueryCtx): Promise<BundlePrice> {
  const price = await ctx.db
    .query("trainingBlockBundlePrices")
    .withIndex("by_revision")
    .order("desc")
    .first();
  return price
    ? {
        amountCents: price.amountCents,
        revision: price.revision,
        stripePriceId: price.stripePriceId,
      }
    : {
        amountCents: TRAINING_BLOCK_BUNDLE_PRICE_CENTS,
        revision: 0,
        stripePriceId: getAuthEnvironment(
          ctx,
          "STRIPE_TRAINING_BLOCK_BUNDLE_PRICE_ID",
        ),
      };
}

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const { amountCents } = await currentPrice(ctx);
    return { amountCents, currency: "usd" as const };
  },
});

export const getAdminPrice = query({
  args: {},
  handler: async (ctx) => {
    const admin = await assertAdmin(ctx);
    const { amountCents, revision } = await currentPrice(ctx);
    return { amountCents, canEdit: Boolean(admin), revision };
  },
});

export const getCheckoutPrice = internalQuery({
  args: {},
  handler: currentPrice,
});

// Old Stripe prices remain valid for sessions opened before an admin's change.
export const getApprovedPrice = internalQuery({
  args: { stripePriceId: v.string() },
  handler: async (ctx, { stripePriceId }): Promise<BundlePrice | null> => {
    const price = await ctx.db
      .query("trainingBlockBundlePrices")
      .withIndex("by_stripe_price", (q) => q.eq("stripePriceId", stripePriceId))
      .unique();
    if (price) return price;
    const current = await currentPrice(ctx);
    return current.stripePriceId === stripePriceId ? current : null;
  },
});

export const publishPrice = internalMutation({
  args: {
    amountCents: v.number(),
    expectedRevision: v.number(),
    stripePriceId: v.string(),
  },
  handler: async (ctx, args): Promise<BundlePrice> => {
    const admin = await assertAdmin(ctx);
    if (!admin) throw new ConvexError("Sign in as an admin to change pricing.");
    validateBundleAmount(args.amountCents);
    const current = await currentPrice(ctx);
    if (current.amountCents === args.amountCents) return current;
    if (current.revision !== args.expectedRevision) {
      throw new ConvexError("The bundle price changed. Refresh and try again.");
    }
    const audit = {
      createdAt: Date.now(),
      createdByUserId: admin._id.toString(),
    };
    if (current.revision === 0) {
      // Preserve the bootstrap price independently of future env changes.
      await ctx.db.insert("trainingBlockBundlePrices", {
        ...current,
        ...audit,
      });
    }
    const next = {
      amountCents: args.amountCents,
      revision: current.revision + 1,
      stripePriceId: args.stripePriceId,
    };
    await ctx.db.insert("trainingBlockBundlePrices", { ...next, ...audit });
    return next;
  },
});
