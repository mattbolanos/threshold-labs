import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  internalQuery,
  type QueryCtx,
  query,
} from "./_generated/server";
import { authComponent } from "./auth";
import { getAuthEnvironment } from "./lib/authEnvironment";
import {
  createStripeClient,
  getStripeCheckoutBrandingSettings,
} from "./lib/stripeAuth";
import {
  getPurchaseTypeKey,
  getTrainingBlockPurchaseDate,
  isCompletedTrainingBlock,
  isTrainingBlockForSale,
  TRAINING_BLOCK_BUNDLE_PRICE_CENTS,
  TRAINING_BLOCK_CURRENCY,
  TRAINING_BLOCK_PRICE_CENTS,
} from "./lib/trainingBlockPurchases";
import { getVerifiedTrainingBlockPurchase } from "./lib/trainingBlockStripe";
import { formatLabDate } from "./lib/workoutAccess";
import { isPreviewAuthEnabled } from "./previewAuth";

const WORKOUTS_PATH = "/lab/training/workouts";

const purchaseRequestValidator = v.union(
  v.object({
    kind: v.literal("block"),
    trainingBlockId: v.id("trainingBlocks"),
  }),
  v.object({ kind: v.literal("bundle") }),
);

const verifiedPurchaseValidator = v.object({
  purchasedAt: v.number(),
  purchaseType: v.union(v.literal("block"), v.literal("bundle")),
  referenceId: v.string(),
  stripeCheckoutSessionId: v.string(),
  stripeCustomerId: v.optional(v.string()),
  stripePaymentIntentId: v.optional(v.string()),
  trainingBlockId: v.optional(v.string()),
});

interface CheckoutBlock {
  _id: Id<"trainingBlocks">;
  isCompleted: boolean;
  isOwned: boolean;
  title: string;
}

const getPurchasesForReferenceId = async (ctx: QueryCtx, referenceId: string) =>
  await ctx.db
    .query("trainingBlockPurchases")
    .withIndex("by_reference_id", (q) => q.eq("referenceId", referenceId))
    .collect();

/** Started blocks, newest first. Includes the in-progress block. */
const getTrainingBlocksForSale = async (ctx: QueryCtx, today: string) => {
  const blocks = await ctx.db
    .query("trainingBlocks")
    .withIndex("by_start_date", (q) => q.lte("startDate", today))
    .order("desc")
    .collect();

  return blocks.filter((block) => isTrainingBlockForSale(block, today));
};

/** Workouts published so far, so an in-progress block shows its current count. */
const countVisibleWorkouts = async (
  ctx: QueryCtx,
  block: Pick<Doc<"trainingBlocks">, "endDate" | "startDate">,
  today: string,
) => {
  const through = block.endDate < today ? block.endDate : today;
  const workouts = await ctx.db
    .query("workouts")
    .withIndex("by_workout_date", (q) =>
      q.gte("workoutDate", block.startDate).lte("workoutDate", through),
    )
    .collect();

  return workouts.filter((workout) => workout.isHidden !== true).length;
};

export const getPurchasesForReference = internalQuery({
  args: { referenceId: v.string() },
  handler: async (ctx, { referenceId }) =>
    await getPurchasesForReferenceId(ctx, referenceId),
});

export const getCheckoutBlocks = internalQuery({
  args: { referenceId: v.string() },
  handler: async (ctx, { referenceId }): Promise<CheckoutBlock[]> => {
    const today = formatLabDate(new Date());
    const [blocks, purchases] = await Promise.all([
      getTrainingBlocksForSale(ctx, today),
      getPurchasesForReferenceId(ctx, referenceId),
    ]);
    const ownedIds = new Set(
      purchases.map((purchase) => purchase.trainingBlockId.toString()),
    );

    return blocks.map((block) => ({
      _id: block._id,
      isCompleted: isCompletedTrainingBlock(block, today),
      isOwned: ownedIds.has(block._id.toString()),
      title: block.title,
    }));
  },
});

/**
 * Started training blocks (completed and in progress) with ownership for the
 * signed-in user. Used by the pricing and subscribe pages, so it never
 * requires an existing entitlement.
 */
export const getTrainingBlockCatalog = query({
  args: {},
  handler: async (ctx) => {
    const today = formatLabDate(new Date());
    const user = isPreviewAuthEnabled()
      ? null
      : await authComponent.safeGetAuthUser(ctx);
    const [blocks, purchases] = await Promise.all([
      getTrainingBlocksForSale(ctx, today),
      user ? getPurchasesForReferenceId(ctx, user._id.toString()) : [],
    ]);
    const ownedIds = new Set(
      purchases.map((purchase) => purchase.trainingBlockId.toString()),
    );

    return await Promise.all(
      blocks.map(async (block) => ({
        _id: block._id,
        description: block.description,
        endDate: block.endDate,
        isCompleted: isCompletedTrainingBlock(block, today),
        isOwned: ownedIds.has(block._id.toString()),
        startDate: block.startDate,
        title: block.title,
        workoutCount: await countVisibleWorkouts(ctx, block, today),
      })),
    );
  },
});

/**
 * Records one row per granted block. A bundle grants every block on sale at
 * the purchase date, including the in-progress block; blocks already owned are
 * skipped, and the checkout session id makes webhook and success-page
 * confirmation idempotent.
 */
export const grantPurchase = internalMutation({
  args: { purchase: verifiedPurchaseValidator },
  handler: async (ctx, { purchase }) => {
    const existingSession = await ctx.db
      .query("trainingBlockPurchases")
      .withIndex("by_stripe_checkout_session", (q) =>
        q.eq("stripeCheckoutSessionId", purchase.stripeCheckoutSessionId),
      )
      .first();

    if (existingSession) {
      return 0;
    }

    const purchaseDate = getTrainingBlockPurchaseDate(purchase.purchasedAt);
    let blocks: Doc<"trainingBlocks">[];

    if (purchase.purchaseType === "block") {
      const blockId = purchase.trainingBlockId
        ? ctx.db.normalizeId("trainingBlocks", purchase.trainingBlockId)
        : null;
      const block = blockId ? await ctx.db.get(blockId) : null;

      if (!block) {
        throw new ConvexError("The purchased training block no longer exists.");
      }

      blocks = [block];
    } else {
      blocks = await getTrainingBlocksForSale(ctx, purchaseDate);
    }

    const existingPurchases = await getPurchasesForReferenceId(
      ctx,
      purchase.referenceId,
    );
    const ownedIds = new Set(
      existingPurchases.map((existing) => existing.trainingBlockId.toString()),
    );
    const { trainingBlockId: _ignored, ...purchaseRecord } = purchase;
    let granted = 0;

    for (const block of blocks) {
      if (ownedIds.has(block._id.toString())) continue;

      await ctx.db.insert("trainingBlockPurchases", {
        ...purchaseRecord,
        accessEnd: block.endDate,
        accessStart: block.startDate,
        trainingBlockId: block._id,
        trainingBlockTitle: block.title,
      });
      granted += 1;
    }

    return granted;
  },
});

export const createCheckout = action({
  args: {
    purchase: purchaseRequestValidator,
    surface: v.optional(v.union(v.literal("pricing"), v.literal("subscribe"))),
  },
  handler: async (ctx, { purchase, surface }): Promise<{ url: string }> => {
    const user = await ctx.runQuery(
      internal.auth.getCurrentStripeCheckoutUser,
      {},
    );

    if (!user) {
      throw new ConvexError("Sign in before opening checkout.");
    }

    const siteUrl = getAuthEnvironment(ctx, "SITE_URL");
    const blocks: CheckoutBlock[] = await ctx.runQuery(
      internal.trainingBlockPurchases.getCheckoutBlocks,
      { referenceId: user.referenceId },
    );
    const workoutsUrl = new URL(WORKOUTS_PATH, siteUrl).toString();
    let priceId: string;
    let blockMetadata: Record<string, string> = {};

    if (purchase.kind === "block") {
      const block = blocks.find(
        (candidate) => candidate._id === purchase.trainingBlockId,
      );

      if (!block) {
        throw new ConvexError("This training block is not available yet.");
      }
      if (block.isOwned) {
        return { url: workoutsUrl };
      }

      priceId = getAuthEnvironment(ctx, "STRIPE_TRAINING_BLOCK_PRICE_ID");
      blockMetadata = {
        trainingBlockId: block._id,
        trainingBlockTitle: block.title,
      };
    } else {
      if (blocks.length === 0) {
        throw new ConvexError("No training blocks are for sale yet.");
      }
      if (blocks.every((block) => block.isOwned)) {
        return { url: workoutsUrl };
      }

      priceId = getAuthEnvironment(
        ctx,
        "STRIPE_TRAINING_BLOCK_BUNDLE_PRICE_ID",
      );
    }

    const metadata = {
      ...blockMetadata,
      purchaseType: getPurchaseTypeKey(purchase.kind),
      referenceId: user.referenceId,
    };
    const cancelPath =
      surface === "pricing"
        ? "/lab/pricing?checkout=blocks-cancelled"
        : "/subscribe?checkout=blocks-cancelled";
    const stripeClient = createStripeClient(ctx);
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
        "/auth/training-blocks/success?session_id={CHECKOUT_SESSION_ID}",
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

    const purchase = await getVerifiedTrainingBlockPurchase({
      checkoutSessionId,
      ctx,
      expectedReferenceId: user.referenceId,
      stripeClient: createStripeClient(ctx),
    });

    if (!purchase) {
      return false;
    }

    await ctx.runMutation(internal.trainingBlockPurchases.grantPurchase, {
      purchase,
    });
    return true;
  },
});

export const trainingBlockProducts = {
  block: {
    currency: TRAINING_BLOCK_CURRENCY,
    price: TRAINING_BLOCK_PRICE_CENTS,
  },
  bundle: {
    currency: TRAINING_BLOCK_CURRENCY,
    price: TRAINING_BLOCK_BUNDLE_PRICE_CENTS,
  },
};
