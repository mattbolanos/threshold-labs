export interface LabSubscription {
  status?: string | null;
  stripeSubscriptionId?: string | null;
}

const LAB_ACCESS_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export const hasActiveLabSubscription = (subscriptions: LabSubscription[]) =>
  subscriptions.some(
    ({ status, stripeSubscriptionId }) =>
      Boolean(stripeSubscriptionId) &&
      Boolean(status && LAB_ACCESS_SUBSCRIPTION_STATUSES.has(status)),
  );
