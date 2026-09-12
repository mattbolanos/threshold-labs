import { type Infer, v } from "convex/values";
import type Stripe from "stripe";

export const subscriptionSnapshotValidator = v.object({
  billingInterval: v.union(v.string(), v.null()),
  cancelAt: v.union(v.number(), v.null()),
  cancelAtPeriodEnd: v.boolean(),
  canceledAt: v.union(v.number(), v.null()),
  endedAt: v.union(v.number(), v.null()),
  isMembershipPrice: v.boolean(),
  metadataReferenceId: v.optional(v.string()),
  metadataSubscriptionId: v.optional(v.string()),
  observedAt: v.number(),
  periodEnd: v.number(),
  periodStart: v.number(),
  seats: v.number(),
  startedAt: v.number(),
  status: v.string(),
  stripeCustomerId: v.string(),
  stripePromotionCodeIds: v.array(v.string()),
  stripeScheduleId: v.union(v.string(), v.null()),
  stripeSubscriptionId: v.string(),
  trialEnd: v.union(v.number(), v.null()),
  trialStart: v.union(v.number(), v.null()),
});

export type SubscriptionSnapshot = Infer<typeof subscriptionSnapshotValidator>;

const milliseconds = (seconds: number | null) =>
  seconds === null ? null : seconds * 1_000;

export function getSubscriptionSnapshot(
  subscription: Stripe.Subscription,
  membershipPriceId: string,
  observedAt: number,
): SubscriptionSnapshot {
  const matchingItem = subscription.items.data.find(
    (item) => item.price.id === membershipPriceId,
  );
  const item = matchingItem ?? subscription.items.data[0];
  if (!item) throw new Error("Stripe subscription has no items.");

  return {
    billingInterval: item.price.recurring?.interval ?? null,
    cancelAt: milliseconds(subscription.cancel_at),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: milliseconds(subscription.canceled_at),
    endedAt: milliseconds(subscription.ended_at),
    isMembershipPrice: Boolean(matchingItem),
    metadataReferenceId: subscription.metadata.referenceId,
    metadataSubscriptionId: subscription.metadata.subscriptionId,
    observedAt,
    periodEnd: item.current_period_end * 1_000,
    periodStart: item.current_period_start * 1_000,
    seats: item.quantity ?? 1,
    startedAt: subscription.created * 1_000,
    status: subscription.status,
    stripeCustomerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    stripePromotionCodeIds: subscription.discounts.flatMap((discount) => {
      if (typeof discount === "string") {
        throw new Error("Stripe subscription discounts were not expanded.");
      }
      if (!discount.promotion_code) return [];
      return [
        typeof discount.promotion_code === "string"
          ? discount.promotion_code
          : discount.promotion_code.id,
      ];
    }),
    stripeScheduleId:
      typeof subscription.schedule === "string"
        ? subscription.schedule
        : (subscription.schedule?.id ?? null),
    stripeSubscriptionId: subscription.id,
    trialEnd: milliseconds(subscription.trial_end),
    trialStart: milliseconds(subscription.trial_start),
  };
}
