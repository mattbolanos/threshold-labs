import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { isLabAccessSubscriptionStatus } from "./lib/labAccess";
import {
  getMembershipAccessEnd,
  getMembershipAccessStart,
} from "./lib/workoutAccess";

/**
 * Keeps one access window per Stripe subscription. The window opens one month
 * before the subscription started and closes on the day it stops being active,
 * so a later subscription never reopens the lapsed period.
 */
export const syncMembershipAccessWindow = internalMutation({
  args: {
    observedAt: v.number(),
    periodEnd: v.optional(v.number()),
    referenceId: v.string(),
    startedAt: v.number(),
    status: v.string(),
    stripeSubscriptionId: v.string(),
  },
  handler: async (
    ctx,
    {
      observedAt,
      periodEnd,
      referenceId,
      startedAt,
      status,
      stripeSubscriptionId,
    },
  ) => {
    const existing = await ctx.db
      .query("membershipAccessWindows")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", stripeSubscriptionId),
      )
      .first();
    const accessEnd = isLabAccessSubscriptionStatus(status)
      ? undefined
      : (existing?.accessEnd ?? getMembershipAccessEnd(observedAt, periodEnd));

    if (!existing) {
      await ctx.db.insert("membershipAccessWindows", {
        accessEnd,
        accessStart: getMembershipAccessStart(startedAt),
        referenceId,
        stripeSubscriptionId,
      });
      return;
    }

    if (existing.accessEnd !== accessEnd) {
      await ctx.db.patch(existing._id, { accessEnd });
    }
  },
});
