import type { PaginationResult } from "convex/server";
import { components } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import type { Doc as AuthDoc } from "../betterAuth/_generated/dataModel";
import { hasActiveLabSubscription, INSIDE_LAB_PLAN_NAME } from "./labAccess";
import { resolveMembershipAccess } from "./membershipAccess";

async function readAuthRecords<Model extends "user" | "subscription">(
  ctx: QueryCtx,
  model: Model,
): Promise<AuthDoc<Model>[]> {
  const records: AuthDoc<Model>[] = [];
  let cursor: string | null = null;
  for (;;) {
    const result: PaginationResult<unknown> = await ctx.runQuery(
      components.betterAuth.adapter.findMany,
      {
        model,
        paginationOpts: { cursor, numItems: 250 },
      },
    );
    records.push(...(result.page as AuthDoc<Model>[]));
    if (result.isDone) return records;
    cursor = result.continueCursor;
  }
}

export function describeAdminUser(
  user: AuthDoc<"user">,
  subscriptions: AuthDoc<"subscription">[],
  purchases: Doc<"trainingBlockPurchases">[],
  windows: Doc<"membershipAccessWindows">[],
  currentUserId?: string,
) {
  const membershipSubscriptions = subscriptions.filter(
    (subscription) => subscription.plan === INSIDE_LAB_PLAN_NAME,
  );
  const activeSubscription = membershipSubscriptions.find((subscription) =>
    hasActiveLabSubscription([subscription]),
  );
  const subscription =
    activeSubscription ??
    membershipSubscriptions.toSorted(
      (left, right) => (right.periodEnd ?? 0) - (left.periodEnd ?? 0),
    )[0];
  const role =
    user.role === "admin" || user.role === "coach" ? user.role : "client";
  const membershipAccess = resolveMembershipAccess({
    activeSubscriptionId: activeSubscription?._id,
    subscriptions: membershipSubscriptions,
    windows,
  });
  return {
    accessSource:
      role === "admin"
        ? ("admin" as const)
        : activeSubscription
          ? ("subscription" as const)
          : purchases.length > 0
            ? ("training_blocks" as const)
            : ("none" as const),
    createdAt: user.createdAt,
    email: user.email,
    emailVerified: user.emailVerified,
    hasStripeCustomer: Boolean(
      user.stripeCustomerId ||
        subscriptions.some((item) => item.stripeCustomerId) ||
        purchases.some((item) => item.stripeCustomerId),
    ),
    id: user._id.toString(),
    isCurrentUser: currentUserId === user._id.toString(),
    name: user.name,
    purchasedBlockCount: purchases.length,
    purchases: purchases
      .toSorted((a, b) => b.purchasedAt - a.purchasedAt)
      .map((purchase) => ({
        accessEnd: purchase.accessEnd,
        accessStart: purchase.accessStart,
        id: purchase._id,
        purchasedAt: purchase.purchasedAt,
        purchaseType: purchase.purchaseType,
        title: purchase.trainingBlockTitle,
      })),
    role,
    subscription: subscription
      ? {
          accessStart: membershipAccess.accessStart,
          cancelAtPeriodEnd: Boolean(subscription.cancelAtPeriodEnd),
          pastAccessWindows: membershipAccess.pastAccessWindows,
          periodEnd: subscription.periodEnd ?? null,
          plan: subscription.plan,
          status: subscription.status ?? "unknown",
        }
      : null,
  };
}

function groupByReference<T extends { referenceId: string }>(records: T[]) {
  const groups = new Map<string, T[]>();
  for (const record of records) {
    const group = groups.get(record.referenceId) ?? [];
    group.push(record);
    groups.set(record.referenceId, group);
  }
  return groups;
}

export async function getAdminUsers(ctx: QueryCtx, currentUserId?: string) {
  const [users, subscriptions, purchases, windows] = await Promise.all([
    readAuthRecords(ctx, "user"),
    readAuthRecords(ctx, "subscription"),
    ctx.db.query("trainingBlockPurchases").collect(),
    ctx.db.query("membershipAccessWindows").collect(),
  ]);
  const subscriptionsByUser = groupByReference(subscriptions);
  const purchasesByUser = groupByReference(purchases);
  const windowsByUser = groupByReference(windows);
  return users
    .toSorted((a, b) => b.createdAt - a.createdAt)
    .map((user) =>
      describeAdminUser(
        user,
        subscriptionsByUser.get(user._id) ?? [],
        purchasesByUser.get(user._id) ?? [],
        windowsByUser.get(user._id) ?? [],
        currentUserId,
      ),
    );
}
