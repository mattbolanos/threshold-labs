import { ConvexError } from "convex/values";
import Stripe from "stripe";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { ActionCtx } from "../_generated/server";
import { getAuthEnvironment } from "./authEnvironment";
import {
  type DiscountCodeType,
  getDiscountCodePrefix,
  getDiscountCouponDefinition,
  isDiscountCouponCompatible,
} from "./discountCodes";
import { createStripeClient } from "./stripeAuth";

function createCustomerFacingCode(discountType: DiscountCodeType) {
  const randomPart = crypto.randomUUID().replaceAll("-", "").slice(0, 12);
  return `${getDiscountCodePrefix(discountType)}-${randomPart}`.toUpperCase();
}

function isMissingStripeResource(error: unknown) {
  return (
    error instanceof Stripe.errors.StripeInvalidRequestError &&
    error.code === "resource_missing"
  );
}

function stripeProductId(
  product: string | Stripe.Product | Stripe.DeletedProduct,
) {
  return typeof product === "string" ? product : product.id;
}

async function ensureDiscountCoupon(
  stripeClient: Stripe,
  discountType: DiscountCodeType,
  priceId: string,
) {
  const price = await stripeClient.prices.retrieve(priceId);
  const definition = getDiscountCouponDefinition(discountType, {
    currency: price.currency,
    id: price.id,
    interval: price.recurring?.interval ?? null,
    productId: stripeProductId(price.product),
    unitAmount: price.unit_amount,
  });

  let coupon: Stripe.Coupon;
  try {
    coupon = await stripeClient.coupons.retrieve(definition.couponId);
  } catch (error) {
    if (!isMissingStripeResource(error)) {
      throw error;
    }

    coupon = await stripeClient.coupons.create(
      {
        amount_off: definition.amountOff,
        applies_to: { products: [definition.productId] },
        currency: definition.currency,
        duration: "forever",
        id: definition.couponId,
        metadata: {
          discountType,
          priceId: price.id,
        },
        name: definition.name,
        percent_off: definition.percentOff,
      },
      { idempotencyKey: `threshold-coupon-${definition.couponId}` },
    );
  }

  const couponMatches = isDiscountCouponCompatible(definition, {
    amountOff: coupon.amount_off,
    currency: coupon.currency,
    duration: coupon.duration,
    percentOff: coupon.percent_off,
    productIds: coupon.applies_to?.products ?? null,
    valid: coupon.valid,
  });

  if (!couponMatches) {
    throw new Error(
      `Stripe coupon ${definition.couponId} does not match the configured offer.`,
    );
  }

  return coupon;
}

export async function issueDiscountCode(
  ctx: ActionCtx,
  {
    availableAt,
    createdByUserId,
    discountType,
    recipientEmail: normalizedRecipient,
  }: {
    availableAt?: number;
    createdByUserId: string;
    discountType: DiscountCodeType;
    recipientEmail?: string;
  },
) {
  const code = createCustomerFacingCode(discountType);
  const discountCodeId: Id<"discountCodes"> = await ctx.runMutation(
    internal.discountCodes.reserveDiscountCode,
    {
      availableAt,
      code,
      createdByUserId: createdByUserId,
      discountType,
      recipientEmail: normalizedRecipient,
    },
  );

  try {
    const stripeClient = createStripeClient(ctx);
    const coupon = await ensureDiscountCoupon(
      stripeClient,
      discountType,
      getAuthEnvironment(ctx, "STRIPE_INSIDE_LAB_PRICE_ID"),
    );

    // Emailed offers are locked to the recipient's Stripe customer, which
    // only exists once they start checkout, so their promotion code is
    // created lazily. See ensureRecipientPromotionCode.
    const promotionCode = normalizedRecipient
      ? null
      : await stripeClient.promotionCodes.create(
          {
            code,
            max_redemptions: 1,
            metadata: {
              createdByUserId: createdByUserId,
              discountCodeId,
              discountType,
            },
            promotion: { coupon: coupon.id, type: "coupon" },
          },
          { idempotencyKey: `threshold-promotion-code-${discountCodeId}` },
        );

    await ctx.runMutation(internal.discountCodes.completeDiscountCode, {
      discountCodeId,
      stripeCouponId: coupon.id,
      stripePromotionCodeId: promotionCode?.id,
    });
  } catch (error) {
    const failureReason =
      error instanceof Error ? error.message : "Stripe provisioning failed.";
    await ctx.runMutation(internal.discountCodes.failDiscountCode, {
      discountCodeId,
      failureReason,
    });
    throw new ConvexError(failureReason);
  }

  if (availableAt !== undefined) {
    return {
      code,
      deliveryStatus: "scheduled" as const,
      discountCodeId,
      discountType,
      recipientEmail: normalizedRecipient,
    };
  }

  if (!normalizedRecipient) {
    return {
      code,
      deliveryStatus: "not_requested" as const,
      discountCodeId,
      discountType,
    };
  }

  try {
    await ctx.runAction(internal.emails.sendDiscountCodeEmail, {
      code,
      discountType,
      recipient: normalizedRecipient,
    });
    await ctx.runMutation(internal.discountCodes.markDiscountCodeDeliverySent, {
      discountCodeId,
    });

    return {
      code,
      deliveryStatus: "sent" as const,
      discountCodeId,
      discountType,
      recipientEmail: normalizedRecipient,
    };
  } catch (error) {
    const deliveryError =
      error instanceof Error
        ? error.message.slice(0, 1000)
        : "Email delivery failed after the code was created.";
    await ctx.runMutation(
      internal.discountCodes.markDiscountCodeDeliveryFailed,
      {
        deliveryError,
        discountCodeId,
      },
    );

    return {
      code,
      deliveryStatus: "failed" as const,
      discountCodeId,
      discountType,
      recipientEmail: normalizedRecipient,
    };
  }
}
