import {
  getMembershipAccessEnd,
  getMembershipAccessStart,
  type WorkoutAccessWindow,
} from "./workoutAccess";

export interface MembershipSubscriptionRecord {
  _creationTime: number;
  _id: string;
  endedAt?: number | null;
  periodEnd?: number | null;
  stripeSubscriptionId?: string | null;
}

export interface StoredMembershipAccessWindow {
  accessEnd?: string | null;
  accessStart: string;
  stripeSubscriptionId: string;
}

export interface MembershipAccess {
  accessStart: string | null;
  pastAccessWindows: WorkoutAccessWindow[];
}

/**
 * Each Stripe subscription owns one access window: it opens one month before
 * that subscription started and closes on the day the subscription stopped
 * being active. Stored windows come from Stripe webhooks; subscriptions that
 * predate the table fall back to the Better Auth record.
 */
export function resolveMembershipAccess({
  activeSubscriptionId,
  subscriptions,
  windows,
}: {
  activeSubscriptionId?: string | null;
  subscriptions: MembershipSubscriptionRecord[];
  windows: StoredMembershipAccessWindow[];
}): MembershipAccess {
  const windowsBySubscription = new Map(
    windows.map((window) => [window.stripeSubscriptionId, window] as const),
  );
  const getStoredWindow = (subscription: MembershipSubscriptionRecord) =>
    subscription.stripeSubscriptionId
      ? windowsBySubscription.get(subscription.stripeSubscriptionId)
      : undefined;
  const getAccessStart = (subscription: MembershipSubscriptionRecord) =>
    getStoredWindow(subscription)?.accessStart ??
    getMembershipAccessStart(subscription._creationTime);
  const activeSubscription = activeSubscriptionId
    ? subscriptions.find(
        (subscription) => subscription._id === activeSubscriptionId,
      )
    : undefined;

  if (!activeSubscription) {
    return { accessStart: null, pastAccessWindows: [] };
  }

  const pastAccessWindows = subscriptions.flatMap((subscription) => {
    if (
      subscription._id === activeSubscription._id ||
      !subscription.stripeSubscriptionId
    ) {
      return [];
    }

    const endedAt = subscription.endedAt ?? subscription.periodEnd;
    const to =
      getStoredWindow(subscription)?.accessEnd ??
      (endedAt
        ? getMembershipAccessEnd(endedAt, subscription.periodEnd)
        : null);

    return to ? [{ from: getAccessStart(subscription), to }] : [];
  });

  return {
    accessStart: getAccessStart(activeSubscription),
    pastAccessWindows,
  };
}
