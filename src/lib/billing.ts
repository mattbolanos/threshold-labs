export const INSIDE_LAB_PLAN_NAME = "inside-the-lab";

export const insideLabMembership = {
  billingInterval: "month",
  price: 70,
  priceLabel: "$70/month",
  title: "Inside the Lab membership",
} as const;

export const trainingBlockPass = {
  price: 100,
  priceLabel: "$100 per block",
  title: "Training block",
} as const;

export const trainingBlockBundle = {
  price: 400,
  priceLabel: "$400 once",
  title: "All current training blocks",
} as const;

export interface TrainingAccessWindow {
  from: string;
  to: string;
}

export interface TrainingBlockPurchase {
  accessEnd: string;
  accessStart: string;
  purchasedAt: number;
  title: string;
  trainingBlockId: string;
}

export interface TrainingBlockAccess {
  purchases: TrainingBlockPurchase[];
  windows: TrainingAccessWindow[];
}

export interface TrainingBlockCatalogEntry {
  _id: string;
  description: string;
  endDate: string;
  isCompleted: boolean;
  isOwned: boolean;
  startDate: string;
  title: string;
  workoutCount: number;
}

export interface MembershipSubscription {
  accessStart?: string | null;
  billing?: {
    amount: number | null;
    currency: string;
    interval: string | null;
    intervalCount: number | null;
  } | null;
  cancelAt: number | null;
  cancelAtPeriodEnd: boolean;
  pastAccessWindows?: TrainingAccessWindow[] | null;
  periodEnd: number | null;
  status: string;
}

interface MembershipStatusDetails {
  badgeLabel: string;
  badgeVariant: "default" | "destructive" | "outline" | "accent";
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

export const formatPurchaseDate = (timestamp: number) =>
  membershipDateFormatter.format(new Date(timestamp));

export const formatTrainingAccessDate = (date: string) =>
  membershipDateFormatter.format(new Date(`${date}T00:00:00.000Z`));

export const formatTrainingAccessRange = (from: string, to: string) =>
  `${formatTrainingAccessDate(from)} – ${formatTrainingAccessDate(to)}`;

const DAY_IN_MS = 24 * 60 * 60 * 1_000;

export function getTrainingBlockWeeks(startDate: string, endDate: string) {
  const days =
    (Date.parse(`${endDate}T00:00:00.000Z`) -
      Date.parse(`${startDate}T00:00:00.000Z`)) /
      DAY_IN_MS +
    1;

  return Math.max(1, Math.round(days / 7));
}

export function formatTrainingBlockSpan(startDate: string, endDate: string) {
  const weeks = getTrainingBlockWeeks(startDate, endDate);

  return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
}

export function formatWorkoutCount(count: number) {
  return `${count} ${count === 1 ? "workout" : "workouts"}`;
}

export function formatTrainingBlockCount(count: number) {
  return `${count} ${count === 1 ? "block" : "blocks"}`;
}

export function getMembershipPriceLabel(subscription: MembershipSubscription) {
  const billing = subscription.billing;

  if (billing?.amount === null || billing?.amount === undefined) {
    return insideLabMembership.priceLabel;
  }

  const hasFractionalAmount = billing.amount % 100 !== 0;
  const price = new Intl.NumberFormat("en-US", {
    currency: billing.currency.toUpperCase(),
    maximumFractionDigits: 2,
    minimumFractionDigits: hasFractionalAmount ? 2 : 0,
    style: "currency",
  }).format(billing.amount / 100);
  const interval = billing.interval ?? insideLabMembership.billingInterval;
  const intervalCount = billing.intervalCount ?? 1;
  const intervalLabel =
    intervalCount === 1 ? interval : `${intervalCount} ${interval}s`;

  return `${price}/${intervalLabel}`;
}

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
