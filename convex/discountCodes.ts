import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
  query,
} from "./_generated/server";
import { assertAdmin, authComponent } from "./auth";
import { normalizeDiscountCodeRecipient } from "./lib/discountCodeEmail";
import { issueDiscountCode } from "./lib/discountCodeIssuing";
import type { DiscountCodeType } from "./lib/discountCodes";
import {
  getTransitionAccessEnd,
  validateTransitionDate,
} from "./lib/memberTransition";
import { createStripeClient } from "./lib/stripeAuth";
import { TRAINING_HISTORY_START_DATE } from "./lib/workoutAccess";
import { isPreviewAuthEnabled } from "./previewAuth";

const discountTypeValidator = v.union(
  v.literal("fifty_monthly"),
  v.literal("free_forever"),
);

const redeemableCodeStatuses = new Set(["active", "provisioning", "revoked"]);

export const listAdminDiscountCodes = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);
    return await ctx.db.query("discountCodes").order("desc").take(100);
  },
});

export const reserveDiscountCode = internalMutation({
  args: {
    availableAt: v.optional(v.number()),
    code: v.string(),
    createdByUserId: v.string(),
    discountType: discountTypeValidator,
    recipientEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    if (args.availableAt && args.recipientEmail) {
      const existing = await ctx.db
        .query("discountCodes")
        .withIndex("by_recipient_email", (q) =>
          q.eq("recipientEmail", args.recipientEmail),
        )
        .collect();
      if (
        existing.some(
          (code) => code.status === "active" || code.status === "provisioning",
        )
      ) {
        throw new ConvexError(
          "This member already has an active or pending offer. Revoke it before scheduling another.",
        );
      }
    }
    return await ctx.db.insert("discountCodes", {
      ...args,
      createdAt: now,
      deliveryStatus: args.recipientEmail ? "pending" : "not_requested",
      status: "provisioning",
      updatedAt: now,
    });
  },
});

export const completeDiscountCode = internalMutation({
  args: {
    discountCodeId: v.id("discountCodes"),
    stripeCouponId: v.string(),
    stripePromotionCodeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const code = await ctx.db.get(args.discountCodeId);
    if (!code || code.status !== "provisioning")
      throw new ConvexError("Pending offer not found.");
    const scheduledEmailId = code.availableAt
      ? await ctx.scheduler.runAt(
          code.availableAt,
          internal.memberTransitions.deliverInvitation,
          { discountCodeId: code._id },
        )
      : undefined;
    if (code.availableAt) {
      await ctx.scheduler.runAt(
        getTransitionAccessEnd(code.availableAt),
        internal.memberTransitions.endComplimentaryAccess,
        { discountCodeId: code._id },
      );
    }
    await ctx.db.patch(args.discountCodeId, {
      scheduledEmailId,
      status: "active",
      stripeCouponId: args.stripeCouponId,
      stripePromotionCodeId: args.stripePromotionCodeId,
      updatedAt: Date.now(),
    });
  },
});

export const failDiscountCode = internalMutation({
  args: {
    discountCodeId: v.id("discountCodes"),
    failureReason: v.string(),
  },
  handler: async (ctx, args) => {
    const discountCode = await ctx.db.get(args.discountCodeId);
    await ctx.db.patch(args.discountCodeId, {
      ...(discountCode?.deliveryStatus === "pending"
        ? {
            deliveryError: "Code creation failed before email delivery.",
            deliveryStatus: "failed" as const,
          }
        : {}),
      failureReason: args.failureReason,
      status: "failed",
      updatedAt: Date.now(),
    });
  },
});

export const getDiscountCodeForAction = internalQuery({
  args: { discountCodeId: v.id("discountCodes") },
  handler: async (ctx, { discountCodeId }) => await ctx.db.get(discountCodeId),
});

/**
 * Emailed codes are tied to the recipient's address. The newest active one
 * wins so a re-issued offer supersedes an older one for the same person.
 */
async function findActiveDiscountCodeForRecipient(
  ctx: QueryCtx,
  email: string,
) {
  const recipientEmail = email.trim().toLowerCase();
  if (!recipientEmail) {
    return null;
  }

  const codes = await ctx.db
    .query("discountCodes")
    .withIndex("by_recipient_email", (q) =>
      q.eq("recipientEmail", recipientEmail),
    )
    .order("desc")
    .collect();

  return codes.find((code) => code.status === "active") ?? null;
}

export const getActiveDiscountCodeForRecipient = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) =>
    await findActiveDiscountCodeForRecipient(ctx, email),
});

/**
 * The offer waiting for the signed-in member, if an admin emailed one to
 * their address. Drives the straight-to-checkout flow on the subscribe page.
 */
export const getPendingDiscountOffer = query({
  args: {},
  handler: async (ctx) => {
    if (isPreviewAuthEnabled()) {
      return null;
    }

    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return null;
    }

    const discountCode = await findActiveDiscountCodeForRecipient(
      ctx,
      user.email,
    );

    return discountCode
      ? {
          availableAt: discountCode.availableAt,
          discountType: discountCode.discountType,
        }
      : null;
  },
});

/**
 * Emailed codes only exist in Stripe once the recipient starts checkout, so
 * the promotion code can be locked to their Stripe customer. Returns the
 * promotion code id that was already attached if another checkout won the race.
 */
export const attachStripePromotionCode = internalMutation({
  args: {
    discountCodeId: v.id("discountCodes"),
    stripePromotionCodeId: v.string(),
  },
  handler: async (ctx, { discountCodeId, stripePromotionCodeId }) => {
    const discountCode = await ctx.db.get(discountCodeId);
    if (!discountCode || discountCode.status !== "active") {
      return null;
    }
    if (discountCode.stripePromotionCodeId) {
      return discountCode.stripePromotionCodeId;
    }

    await ctx.db.patch(discountCodeId, {
      stripePromotionCodeId,
      updatedAt: Date.now(),
    });
    return stripePromotionCodeId;
  },
});

export const markDiscountCodeDeliverySent = internalMutation({
  args: { discountCodeId: v.id("discountCodes") },
  handler: async (ctx, { discountCodeId }) => {
    const now = Date.now();
    await ctx.db.patch(discountCodeId, {
      deliveredAt: now,
      deliveryError: undefined,
      deliveryStatus: "sent",
      updatedAt: now,
    });
  },
});

export const markDiscountCodeDeliveryFailed = internalMutation({
  args: {
    deliveryError: v.string(),
    discountCodeId: v.id("discountCodes"),
  },
  handler: async (ctx, { deliveryError, discountCodeId }) => {
    await ctx.db.patch(discountCodeId, {
      deliveryError,
      deliveryStatus: "failed",
      updatedAt: Date.now(),
    });
  },
});

export const generateDiscountCode = action({
  args: {
    availableAt: v.optional(v.number()),
    discountType: discountTypeValidator,
    recipientEmail: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { availableAt, discountType, recipientEmail },
  ): Promise<{
    code: string;
    deliveryStatus: "failed" | "not_requested" | "sent" | "scheduled";
    discountCodeId: Id<"discountCodes">;
    discountType: DiscountCodeType;
    recipientEmail?: string;
  }> => {
    const admin = await assertAdmin(ctx);
    if (!admin) {
      throw new ConvexError("Discount codes are unavailable in preview mode.");
    }

    let normalizedRecipient: string | undefined;
    if (recipientEmail !== undefined) {
      try {
        normalizedRecipient = normalizeDiscountCodeRecipient(recipientEmail);
      } catch (error) {
        throw new ConvexError(
          error instanceof Error
            ? error.message
            : "Enter a valid recipient email address.",
        );
      }
    }

    if (availableAt !== undefined) {
      validateTransitionDate({
        availableAt,
        discountType,
        recipientEmail: normalizedRecipient,
      });
    }

    return issueDiscountCode(ctx, {
      availableAt,
      createdByUserId: admin._id.toString(),
      discountType,
      recipientEmail: normalizedRecipient,
    });
  },
});

export const revokeDiscountCode = action({
  args: { discountCodeId: v.id("discountCodes") },
  handler: async (
    ctx,
    { discountCodeId },
  ): Promise<{ discountCodeId: Id<"discountCodes"> }> => {
    const admin = await assertAdmin(ctx);
    if (!admin) {
      throw new ConvexError("Discount codes are unavailable in preview mode.");
    }

    const assignment = await ctx.runQuery(
      internal.discountCodes.getDiscountCodeForAction,
      { discountCodeId },
    );
    if (!assignment) {
      throw new ConvexError("Active discount code not found.");
    }
    if (assignment.status !== "active") {
      throw new ConvexError("Only active discount codes can be revoked.");
    }

    // Emailed offers have no Stripe promotion code until the recipient starts
    // checkout, so revoking them is purely a local status change.
    if (assignment.stripePromotionCodeId) {
      const stripeClient = createStripeClient(ctx);
      const promotionCode = await stripeClient.promotionCodes.retrieve(
        assignment.stripePromotionCodeId,
      );
      if (promotionCode.times_redeemed > 0) {
        await ctx.runMutation(
          internal.discountCodes.markDiscountCodesRedeemed,
          {
            redeemedAt: Date.now(),
            stripePromotionCodeIds: [promotionCode.id],
          },
        );
        throw new ConvexError("This discount code has already been redeemed.");
      }

      await stripeClient.promotionCodes.update(promotionCode.id, {
        active: false,
      });
    }

    const wasRevoked: boolean = await ctx.runMutation(
      internal.discountCodes.markDiscountCodeRevoked,
      { discountCodeId },
    );
    if (!wasRevoked) {
      throw new ConvexError("This discount code has already been redeemed.");
    }

    return { discountCodeId };
  },
});

export const markDiscountCodeRevoked = internalMutation({
  args: { discountCodeId: v.id("discountCodes") },
  handler: async (ctx, { discountCodeId }) => {
    const discountCode = await ctx.db.get(discountCodeId);
    if (discountCode?.status !== "active") {
      return false;
    }

    const now = Date.now();
    if (discountCode.scheduledEmailId) {
      await ctx.scheduler.cancel(discountCode.scheduledEmailId);
    }
    await ctx.db.patch(discountCodeId, {
      revokedAt: now,
      status: "revoked",
      updatedAt: now,
    });
    return true;
  },
});

export const markDiscountCodesRedeemed = internalMutation({
  args: {
    redeemedAt: v.number(),
    redeemedByEmail: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    stripePromotionCodeIds: v.array(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      redeemedAt,
      redeemedByEmail,
      stripeCustomerId,
      stripePromotionCodeIds,
      stripeSubscriptionId,
    },
  ) => {
    for (const stripePromotionCodeId of stripePromotionCodeIds) {
      const assignment = await ctx.db
        .query("discountCodes")
        .withIndex("by_stripe_promotion_code", (q) =>
          q.eq("stripePromotionCodeId", stripePromotionCodeId),
        )
        .unique();
      if (assignment && redeemableCodeStatuses.has(assignment.status)) {
        await ctx.db.patch(assignment._id, {
          redeemedAt,
          redeemedByEmail,
          revokedAt: undefined,
          status: "redeemed",
          stripeCustomerId,
          stripeSubscriptionId,
          updatedAt: redeemedAt,
        });

        if (stripeSubscriptionId) {
          await grantFullTrainingHistory(ctx, stripeSubscriptionId);
        }
      }
    }
  },
});

/**
 * Both discount offers include every workout, past and present. The webhook
 * handler syncs the subscription's access window before recording the
 * redemption, so the window is widened here rather than at creation time.
 */
async function grantFullTrainingHistory(
  ctx: MutationCtx,
  stripeSubscriptionId: string,
) {
  const accessWindow = await ctx.db
    .query("membershipAccessWindows")
    .withIndex("by_stripe_subscription", (q) =>
      q.eq("stripeSubscriptionId", stripeSubscriptionId),
    )
    .first();

  if (accessWindow && accessWindow.accessStart > TRAINING_HISTORY_START_DATE) {
    await ctx.db.patch(accessWindow._id, {
      accessStart: TRAINING_HISTORY_START_DATE,
    });
  }
}
