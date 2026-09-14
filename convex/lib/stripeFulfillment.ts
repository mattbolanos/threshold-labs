import type { GenericCtx } from "@convex-dev/better-auth";
import { makeFunctionReference } from "convex/server";
import type Stripe from "stripe";
import { internal } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import { getAuthEnvironment } from "./authEnvironment";
import {
  getSubscriptionSnapshot,
  type SubscriptionSnapshot,
} from "./stripeSubscriptionSnapshot";
import { getVerifiedTrainingBlockPurchase } from "./trainingBlockStripe";

const beginReconciliation = makeFunctionReference<
  "mutation",
  { stripeSubscriptionId: string },
  number
>("stripeSubscriptions:beginReconciliation");
const applySubscription = makeFunctionReference<
  "mutation",
  {
    generation: number;
    redeemedByEmail?: string;
    snapshot: SubscriptionSnapshot;
  },
  { referenceId: string | null; status: "ignored" | "synced" }
>("stripeSubscriptions:applySubscription");

/** Fetch after claiming a generation, so an older in-flight read cannot win. */
export async function reconcileStripeSubscription(
  ctx: GenericCtx<DataModel>,
  stripeClient: Stripe,
  stripeSubscriptionId: string,
  event?: Stripe.Event,
  redeemedByEmail?: string,
) {
  if (!("runMutation" in ctx)) {
    throw new Error("Stripe fulfillment requires a Convex action context.");
  }
  const generation = await ctx.runMutation(beginReconciliation, {
    stripeSubscriptionId,
  });
  const subscription = await stripeClient.subscriptions.retrieve(
    stripeSubscriptionId,
    { expand: ["discounts"] },
  );
  const eventSubscription = event?.type.startsWith("customer.subscription.")
    ? (event.data.object as Stripe.Subscription)
    : null;
  // An old event may now retrieve a different status. Its old timestamp must
  // not truncate the new status's access window; cancellation has ended_at.
  const observedAt =
    eventSubscription?.status === subscription.status && event
      ? event.created * 1_000
      : Date.now();
  const snapshot = getSubscriptionSnapshot(
    subscription,
    getAuthEnvironment(ctx, "STRIPE_INSIDE_LAB_PRICE_ID"),
    observedAt,
  );
  return await ctx.runMutation(applySubscription, {
    generation,
    redeemedByEmail: redeemedByEmail?.trim().toLowerCase(),
    snapshot,
  });
}

export async function fulfillStripeEvent(
  ctx: GenericCtx<DataModel>,
  stripeClient: Stripe,
  event: Stripe.Event,
): Promise<void> {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await reconcileStripeSubscription(
        ctx,
        stripeClient,
        event.data.object.id,
        event,
      );
      return;
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      if (session.mode === "subscription" && session.subscription) {
        await reconcileStripeSubscription(
          ctx,
          stripeClient,
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id,
          event,
          session.customer_details?.email ?? undefined,
        );
      } else if (session.mode === "payment") {
        const purchase = await getVerifiedTrainingBlockPurchase({
          checkoutSessionId: session.id,
          ctx,
          stripeClient,
        });
        if (purchase) {
          if (!("runMutation" in ctx)) {
            throw new Error(
              "Stripe fulfillment requires a Convex action context.",
            );
          }
          await ctx.runMutation(internal.trainingBlockPurchases.grantPurchase, {
            purchase,
          });
        }
      }
    }
  }
}
