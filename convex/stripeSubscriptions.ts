import { ConvexError, v } from "convex/values";
import { components, internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";
import type { Doc as AuthDoc } from "./betterAuth/_generated/dataModel";
import { INSIDE_LAB_PLAN_NAME } from "./lib/labAccess";
import { createStripeClient } from "./lib/stripeAuth";
import { reconcileStripeSubscription } from "./lib/stripeFulfillment";
import { subscriptionSnapshotValidator } from "./lib/stripeSubscriptionSnapshot";

/** A newer request invalidates older Stripe reads before they can write. */
export const beginReconciliation = internalMutation({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, { stripeSubscriptionId }): Promise<number> => {
    const existing = await ctx.db
      .query("stripeSubscriptionReconciliations")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", stripeSubscriptionId),
      )
      .unique();
    const generation = (existing?.generation ?? 0) + 1;
    if (existing) {
      await ctx.db.patch(existing._id, { generation });
    } else {
      await ctx.db.insert("stripeSubscriptionReconciliations", {
        generation,
        stripeSubscriptionId,
      });
    }
    return generation;
  },
});

/**
 * Auth state, the access window, and discount fulfillment commit together.
 * Nested component mutations share this Convex mutation's transaction.
 */
export const applySubscription = internalMutation({
  args: {
    generation: v.number(),
    redeemedByEmail: v.optional(v.string()),
    snapshot: subscriptionSnapshotValidator,
  },
  handler: async (
    ctx,
    { generation, redeemedByEmail, snapshot },
  ): Promise<{ referenceId: string | null; status: "ignored" | "synced" }> => {
    const reconciliation = await ctx.db
      .query("stripeSubscriptionReconciliations")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", snapshot.stripeSubscriptionId),
      )
      .unique();
    if (reconciliation?.generation !== generation) {
      // Do not acknowledge an obsolete read: Stripe will retry after the
      // overlapping request finishes, even if that newer request failed.
      throw new ConvexError(
        "Subscription changed during reconciliation. Retry.",
      );
    }

    let existing = (await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "subscription",
      where: [
        { field: "stripeSubscriptionId", value: snapshot.stripeSubscriptionId },
      ],
    })) as AuthDoc<"subscription"> | null;
    const pending =
      !existing && snapshot.metadataSubscriptionId
        ? ((await ctx.runQuery(components.betterAuth.adapter.findOne, {
            model: "subscription",
            where: [{ field: "_id", value: snapshot.metadataSubscriptionId }],
          })) as AuthDoc<"subscription"> | null)
        : null;
    // Several open checkouts can share an unfinished Better Auth row. Once
    // assigned, retain its history and create a separate row for another sub.
    if (pending && !pending.stripeSubscriptionId) existing = pending;
    if (
      !snapshot.isMembershipPrice &&
      existing?.plan !== INSIDE_LAB_PLAN_NAME
    ) {
      return { referenceId: null, status: "ignored" };
    }

    const referenceId =
      existing?.referenceId ??
      pending?.referenceId ??
      snapshot.metadataReferenceId;
    const user = (await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: referenceId
        ? [{ field: "_id", value: referenceId }]
        : [{ field: "stripeCustomerId", value: snapshot.stripeCustomerId }],
    })) as AuthDoc<"user"> | null;
    const resolvedReferenceId = referenceId ?? user?._id;
    if (!resolvedReferenceId) return { referenceId: null, status: "ignored" };
    // One Stripe account can send events to multiple Convex deployments.
    // Only link a new subscription to a local user with the same customer;
    // existing subscription history can still sync after a customer repair.
    if (
      !existing?.stripeSubscriptionId &&
      (!user || user.stripeCustomerId !== snapshot.stripeCustomerId)
    ) {
      return { referenceId: null, status: "ignored" };
    }

    const subscriptionData = {
      billingInterval: snapshot.billingInterval,
      cancelAt: snapshot.cancelAt,
      cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
      canceledAt: snapshot.canceledAt,
      endedAt: snapshot.endedAt,
      periodEnd: snapshot.periodEnd,
      periodStart: snapshot.periodStart,
      plan: INSIDE_LAB_PLAN_NAME,
      referenceId: resolvedReferenceId,
      seats: snapshot.seats,
      status: snapshot.status,
      stripeCustomerId: snapshot.stripeCustomerId,
      stripeScheduleId: snapshot.stripeScheduleId,
      stripeSubscriptionId: snapshot.stripeSubscriptionId,
      trialEnd: snapshot.trialEnd,
      trialStart: snapshot.trialStart,
    };
    if (existing) {
      await ctx.runMutation(components.betterAuth.adapter.updateOne, {
        input: {
          model: "subscription",
          update: subscriptionData,
          where: [{ field: "_id", value: existing._id }],
        },
      });
    } else {
      await ctx.runMutation(components.betterAuth.adapter.create, {
        input: { data: subscriptionData, model: "subscription" },
      });
    }

    await ctx.runMutation(
      internal.subscriptionAccess.syncMembershipAccessWindow,
      {
        observedAt: snapshot.endedAt ?? snapshot.observedAt,
        periodEnd: snapshot.periodEnd,
        referenceId: resolvedReferenceId,
        startedAt: snapshot.startedAt,
        status: snapshot.status,
        stripeSubscriptionId: snapshot.stripeSubscriptionId,
      },
    );
    if (
      snapshot.stripePromotionCodeIds.length > 0 &&
      snapshot.status !== "incomplete" &&
      snapshot.status !== "incomplete_expired"
    ) {
      await ctx.runMutation(internal.discountCodes.markDiscountCodesRedeemed, {
        redeemedAt: snapshot.startedAt,
        redeemedByEmail: redeemedByEmail ?? user?.email.trim().toLowerCase(),
        stripeCustomerId: snapshot.stripeCustomerId,
        stripePromotionCodeIds: snapshot.stripePromotionCodeIds,
        stripeSubscriptionId: snapshot.stripeSubscriptionId,
      });
    }
    return { referenceId: resolvedReferenceId, status: "synced" };
  },
});

/** Repairs a known subscription without replaying old event snapshots. */
export const reconcile = internalAction({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, { stripeSubscriptionId }) =>
    await reconcileStripeSubscription(
      ctx,
      createStripeClient(ctx),
      stripeSubscriptionId,
    ),
});
