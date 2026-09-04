import type { GenericCtx } from "@convex-dev/better-auth";
import type Stripe from "stripe";
import { internal } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";

interface RecipientCheckoutIdentity {
  email: string;
  stripeCustomerId: string | null | undefined;
}

/**
 * Emailed offers are only redeemable by the address they were sent to. The
 * Stripe promotion code is created the first time that member starts checkout
 * so it can be locked to their Stripe customer, which Stripe enforces even if
 * the code leaks. Returns the promotion code to pre-apply, or null when no
 * offer is waiting for this member.
 */
export async function ensureRecipientPromotionCode(
  ctx: GenericCtx<DataModel>,
  stripeClient: Stripe,
  { email, stripeCustomerId }: RecipientCheckoutIdentity,
) {
  if (!("runQuery" in ctx) || !("runMutation" in ctx)) {
    return null;
  }

  const discountCode = await ctx.runQuery(
    internal.discountCodes.getActiveDiscountCodeForRecipient,
    { email },
  );
  if (!discountCode) {
    return null;
  }
  if (discountCode.stripePromotionCodeId) {
    return discountCode.stripePromotionCodeId;
  }
  if (!discountCode.stripeCouponId) {
    throw new Error("This offer is missing its Stripe coupon.");
  }
  if (!stripeCustomerId) {
    throw new Error("A Stripe customer is required to apply this offer.");
  }

  const promotionCode = await stripeClient.promotionCodes.create(
    {
      code: discountCode.code,
      customer: stripeCustomerId,
      max_redemptions: 1,
      metadata: {
        createdByUserId: discountCode.createdByUserId,
        discountCodeId: discountCode._id,
        discountType: discountCode.discountType,
        recipientEmail: discountCode.recipientEmail ?? "",
      },
      promotion: { coupon: discountCode.stripeCouponId, type: "coupon" },
    },
    { idempotencyKey: `threshold-promotion-code-${discountCode._id}` },
  );

  const attachedPromotionCodeId = await ctx.runMutation(
    internal.discountCodes.attachStripePromotionCode,
    {
      discountCodeId: discountCode._id,
      stripePromotionCodeId: promotionCode.id,
    },
  );

  // The offer was revoked or redeemed while Stripe was creating the code.
  if (!attachedPromotionCodeId) {
    await stripeClient.promotionCodes.update(promotionCode.id, {
      active: false,
    });
    return null;
  }

  return attachedPromotionCodeId;
}
