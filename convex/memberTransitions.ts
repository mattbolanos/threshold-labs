import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalAction, internalMutation } from "./_generated/server";
import { assertAdmin } from "./auth";
import {
  getTransitionAccessEnd,
  isDiscountOfferAvailable,
} from "./lib/memberTransition";

/** Mutating the grant at expiry also invalidates live Convex access queries. */
export const endComplimentaryAccess = internalMutation({
  args: { discountCodeId: v.id("discountCodes") },
  handler: async (ctx, { discountCodeId }) => {
    const offer = await ctx.db.get(discountCodeId);
    if (
      !offer?.availableAt ||
      Date.now() < getTransitionAccessEnd(offer.availableAt)
    )
      return;
    await ctx.db.patch(discountCodeId, {
      complimentaryAccessExpired: true,
      updatedAt: Date.now(),
    });
  },
});

/** Scheduled delivery is a no-op if the offer has since been revoked or redeemed. */
export const deliverInvitation = internalAction({
  args: { discountCodeId: v.id("discountCodes") },
  handler: async (ctx, { discountCodeId }): Promise<void> => {
    const offer = await ctx.runQuery(
      internal.discountCodes.getDiscountCodeForAction,
      { discountCodeId },
    );
    if (
      !offer?.availableAt ||
      !offer.recipientEmail ||
      offer.deliveryStatus === "sent" ||
      !isDiscountOfferAvailable(offer)
    )
      return;
    try {
      await ctx.runAction(internal.emails.sendDiscountCodeEmail, {
        code: offer.code,
        discountType: offer.discountType,
        recipient: offer.recipientEmail,
      });
      await ctx.runMutation(
        internal.discountCodes.markDiscountCodeDeliverySent,
        { discountCodeId },
      );
    } catch (error) {
      await ctx.runMutation(
        internal.discountCodes.markDiscountCodeDeliveryFailed,
        {
          deliveryError:
            error instanceof Error
              ? error.message.slice(0, 1000)
              : "Invitation delivery failed.",
          discountCodeId,
        },
      );
    }
  },
});

export const retryInvitation = action({
  args: { discountCodeId: v.id("discountCodes") },
  handler: async (ctx, { discountCodeId }): Promise<void> => {
    const admin = await assertAdmin(ctx);
    if (!admin)
      throw new ConvexError("Invitations are unavailable in preview mode.");
    await ctx.runAction(internal.memberTransitions.deliverInvitation, {
      discountCodeId,
    });
  },
});
