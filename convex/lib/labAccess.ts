export interface LabSubscription {
  plan?: string | null;
  status?: string | null;
  stripeSubscriptionId?: string | null;
}

export const INSIDE_LAB_PLAN_NAME = "inside-the-lab";

const LAB_ACCESS_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export const hasActiveLabSubscription = (subscriptions: LabSubscription[]) =>
  subscriptions.some(
    ({ plan, status, stripeSubscriptionId }) =>
      plan === INSIDE_LAB_PLAN_NAME &&
      Boolean(stripeSubscriptionId) &&
      Boolean(status && LAB_ACCESS_SUBSCRIPTION_STATUSES.has(status)),
  );
