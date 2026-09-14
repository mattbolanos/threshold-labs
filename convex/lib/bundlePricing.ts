import { ConvexError } from "convex/values";
import type Stripe from "stripe";
import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import { assertAdmin } from "../auth";

export interface BundlePrice {
  amountCents: number;
  revision: number;
  stripePriceId: string;
}

export function validateBundleAmount(amountCents: number) {
  if (
    !Number.isSafeInteger(amountCents) ||
    amountCents < 100 ||
    amountCents > 99_999_999
  ) {
    throw new ConvexError(
      "Enter a price from $1 to $999,999.99, with at most two decimal places.",
    );
  }
}

export async function changeBundlePrice(
  ctx: ActionCtx,
  args: { amountCents: number; expectedRevision: number },
  stripe: Stripe,
): Promise<BundlePrice> {
  const admin = await assertAdmin(ctx);
  if (!admin) throw new ConvexError("Sign in as an admin to change pricing.");
  validateBundleAmount(args.amountCents);
  const current: BundlePrice = await ctx.runQuery(
    internal.bundlePricing.getCheckoutPrice,
    {},
  );
  if (current.amountCents === args.amountCents) return current;
  if (current.revision !== args.expectedRevision) {
    throw new ConvexError("The bundle price changed. Refresh and try again.");
  }

  // Stripe amounts are immutable. Reuse the product and create a new price.
  const previous = await stripe.prices.retrieve(current.stripePriceId, {
    expand: ["product"],
  });
  const product = previous.product;
  if (
    previous.currency !== "usd" ||
    previous.type !== "one_time" ||
    previous.unit_amount !== current.amountCents ||
    typeof product === "string" ||
    product.deleted ||
    !product.active
  ) {
    throw new ConvexError(
      "The bundle's Stripe product needs attention before its price can change.",
    );
  }
  const price = await stripe.prices.create(
    {
      currency: "usd",
      product: product.id,
      unit_amount: args.amountCents,
      ...(previous.tax_behavior && previous.tax_behavior !== "unspecified"
        ? { tax_behavior: previous.tax_behavior }
        : {}),
    },
    {
      idempotencyKey: `bundle-price:${process.env.CONVEX_CLOUD_URL}:${current.revision}:${current.stripePriceId}:${args.amountCents}`,
    },
  );
  // A failed Stripe request never publishes a price; a concurrent edit must
  // still match the revision inside Convex's atomic mutation.
  return await ctx.runMutation(internal.bundlePricing.publishPrice, {
    ...args,
    stripePriceId: price.id,
  });
}
