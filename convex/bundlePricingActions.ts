import { v } from "convex/values";
import { action } from "./_generated/server";
import { type BundlePrice, changeBundlePrice } from "./lib/bundlePricing";
import { createStripeClient } from "./lib/stripeAuth";

export const update = action({
  args: { amountCents: v.number(), expectedRevision: v.number() },
  handler: async (ctx, args): Promise<BundlePrice> =>
    await changeBundlePrice(ctx, args, createStripeClient(ctx)),
});
