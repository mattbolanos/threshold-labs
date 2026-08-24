export const INSIDE_LAB_PLAN_NAME = "inside-the-lab";

export const insideLabMembership = {
  billingInterval: "month",
  price: 70,
  priceLabel: "$70/month",
  title: "Inside the Lab membership",
} as const;

export interface MembershipSubscription {
  cancelAt: number | null;
  cancelAtPeriodEnd: boolean;
  periodEnd: number | null;
  status: string;
}

interface MembershipStatusDetails {
  badgeLabel: string;
  badgeVariant: "default" | "destructive" | "outline" | "secondary";
  description: string;
  periodLabel: string | null;
  periodValue: string | null;
}

const membershipDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

const formatMembershipDate = (timestamp: number | null) =>
  timestamp ? membershipDateFormatter.format(new Date(timestamp)) : null;

export function getMembershipStatusDetails(
  subscription: MembershipSubscription,
): MembershipStatusDetails {
  const periodEnd = formatMembershipDate(subscription.periodEnd);
  const cancellationDate = formatMembershipDate(subscription.cancelAt);
  const isCurrentlyActive =
    subscription.status === "active" || subscription.status === "trialing";

  if (
    isCurrentlyActive &&
    (subscription.cancelAtPeriodEnd || subscription.cancelAt)
  ) {
    const accessEnd = cancellationDate ?? periodEnd;

    return {
      badgeLabel: "Cancellation scheduled",
      badgeVariant: "destructive",
      description: accessEnd
        ? `You canceled your membership. Access continues through ${accessEnd}, and you won’t be charged again.`
        : "You canceled your membership. Access continues through the current billing period, and you won’t be charged again.",
      periodLabel: accessEnd ? "Access until" : null,
      periodValue: accessEnd,
    };
  }

  if (subscription.status === "active") {
    return {
      badgeLabel: "Active",
      badgeVariant: "default",
      description: periodEnd
        ? `Your membership is active and renews on ${periodEnd}.`
        : "Your membership is active.",
      periodLabel: periodEnd ? "Renews" : null,
      periodValue: periodEnd,
    };
  }

  if (subscription.status === "trialing") {
    return {
      badgeLabel: "Trial",
      badgeVariant: "outline",
      description: periodEnd
        ? `Your trial is active through ${periodEnd}.`
        : "Your trial is active.",
      periodLabel: periodEnd ? "Trial ends" : null,
      periodValue: periodEnd,
    };
  }

  if (subscription.status === "past_due" || subscription.status === "unpaid") {
    return {
      badgeLabel: "Payment issue",
      badgeVariant: "destructive",
      description:
        "Your membership has a payment issue. Update your payment method in Stripe to restore access.",
      periodLabel: null,
      periodValue: null,
    };
  }

  if (subscription.status === "canceled") {
    return {
      badgeLabel: "Canceled",
      badgeVariant: "outline",
      description: periodEnd
        ? `Your membership ended on ${periodEnd}.`
        : "Your membership is canceled.",
      periodLabel: periodEnd ? "Ended" : null,
      periodValue: periodEnd,
    };
  }

  if (subscription.status === "paused") {
    return {
      badgeLabel: "Paused",
      badgeVariant: "outline",
      description:
        "Your membership is paused. Open Stripe to review your billing settings.",
      periodLabel: null,
      periodValue: null,
    };
  }

  if (subscription.status === "incomplete") {
    return {
      badgeLabel: "Setup incomplete",
      badgeVariant: "destructive",
      description:
        "Your membership setup is incomplete. Open Stripe to finish your payment details.",
      periodLabel: null,
      periodValue: null,
    };
  }

  return {
    badgeLabel: "Inactive",
    badgeVariant: "outline",
    description: "Your membership is not currently active.",
    periodLabel: periodEnd ? "Ended" : null,
    periodValue: periodEnd,
  };
}
