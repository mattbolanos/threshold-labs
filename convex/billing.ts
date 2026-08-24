import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { createStripeClient } from "./lib/stripeAuth";

export const getCurrentStripeMembership = action({
  args: {},
  handler: async (ctx) => {
    const stripeSubscriptionId = await ctx.runQuery(
      internal.auth.getCurrentStripeSubscriptionReference,
      {},
    );

    if (!stripeSubscriptionId) {
      return null;
    }

    try {
      const subscription =
        await createStripeClient(ctx).subscriptions.retrieve(
          stripeSubscriptionId,
        );
      const periodEnd = subscription.items.data[0]?.current_period_end;

      return {
        cancelAt: subscription.cancel_at ? subscription.cancel_at * 1000 : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        periodEnd: periodEnd ? periodEnd * 1000 : null,
        status: subscription.status,
      };
    } catch {
      return null;
    }
  },
});
