import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { createStripeClient } from "./lib/stripeAuth";

interface StripeMembership {
  billing: {
    amount: number | null;
    currency: string;
    interval: string | null;
    intervalCount: number | null;
  } | null;
  cancelAt: number | null;
  cancelAtPeriodEnd: boolean;
  periodEnd: number | null;
  status: string;
}

export const getCurrentStripeMembership = action({
  args: {},
  handler: async (ctx): Promise<StripeMembership | null> => {
    const stripeSubscriptionId: string | null = await ctx.runQuery(
      internal.auth.getCurrentStripeSubscriptionReference,
      {},
    );

    if (!stripeSubscriptionId) {
      return null;
    }

    try {
      const stripeClient = createStripeClient(ctx);
      const [subscription, upcomingInvoice] = await Promise.all([
        stripeClient.subscriptions.retrieve(stripeSubscriptionId, {
          expand: ["latest_invoice"],
        }),
        stripeClient.invoices
          .createPreview({ subscription: stripeSubscriptionId })
          .catch(() => null),
      ]);
      const periodEnd = subscription.items.data[0]?.current_period_end;
      const recurringPrice = subscription.items.data.find(
        (item) => item.price.recurring,
      )?.price.recurring;
      const latestInvoice =
        subscription.latest_invoice &&
        typeof subscription.latest_invoice !== "string"
          ? subscription.latest_invoice
          : null;
      const billingInvoice = upcomingInvoice ?? latestInvoice;

      return {
        billing: billingInvoice
          ? {
              amount:
                billingInvoice.total_excluding_tax ?? billingInvoice.total,
              currency: billingInvoice.currency,
              interval: recurringPrice?.interval ?? null,
              intervalCount: recurringPrice?.interval_count ?? null,
            }
          : null,
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
