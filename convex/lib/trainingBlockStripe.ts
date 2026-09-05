import type { GenericCtx } from "@convex-dev/better-auth";
import type Stripe from "stripe";
import type { DataModel } from "../_generated/dataModel";
import { getAuthEnvironment } from "./authEnvironment";
import {
  TRAINING_BLOCK_BUNDLE_PRICE_CENTS,
  TRAINING_BLOCK_BUNDLE_PURCHASE_TYPE,
  TRAINING_BLOCK_CURRENCY,
  TRAINING_BLOCK_PRICE_CENTS,
  TRAINING_BLOCK_PURCHASE_TYPE,
  type TrainingBlockPurchaseKind,
} from "./trainingBlockPurchases";

export interface VerifiedTrainingBlockPurchase {
  purchaseType: TrainingBlockPurchaseKind;
  purchasedAt: number;
  referenceId: string;
  stripeCheckoutSessionId: string;
  stripeCustomerId?: string;
  stripePaymentIntentId?: string;
  trainingBlockId?: string;
}

type TrainingBlockCheckoutSession = Pick<
  Stripe.Checkout.Session,
  | "amount_total"
  | "client_reference_id"
  | "created"
  | "currency"
  | "customer"
  | "id"
  | "metadata"
  | "mode"
  | "payment_intent"
  | "payment_status"
  | "status"
> & {
  line_items?: {
    data: Array<
      Pick<Stripe.LineItem, "amount_subtotal" | "price" | "quantity">
    >;
  };
};

const getStripeId = (value: string | { id: string } | null | undefined) =>
  typeof value === "string" ? value : value?.id;

const getPurchaseKind = (
  purchaseType: string | undefined,
): TrainingBlockPurchaseKind | null => {
  if (purchaseType === TRAINING_BLOCK_PURCHASE_TYPE) return "block";
  if (purchaseType === TRAINING_BLOCK_BUNDLE_PURCHASE_TYPE) return "bundle";
  return null;
};

export function verifyTrainingBlockCheckoutSession({
  checkoutSession,
  expectedBlockPriceId,
  expectedBundlePriceId,
  expectedReferenceId,
}: {
  checkoutSession: TrainingBlockCheckoutSession;
  expectedBlockPriceId: string;
  expectedBundlePriceId: string;
  expectedReferenceId?: string;
}): VerifiedTrainingBlockPurchase | null {
  const kind = getPurchaseKind(checkoutSession.metadata?.purchaseType);

  if (!kind) {
    return null;
  }

  const expectedPriceId =
    kind === "block" ? expectedBlockPriceId : expectedBundlePriceId;
  const expectedAmount =
    kind === "block"
      ? TRAINING_BLOCK_PRICE_CENTS
      : TRAINING_BLOCK_BUNDLE_PRICE_CENTS;
  const referenceId =
    checkoutSession.client_reference_id ??
    checkoutSession.metadata?.referenceId;
  const trainingBlockId = checkoutSession.metadata?.trainingBlockId;
  const lineItems = checkoutSession.line_items?.data ?? [];
  const lineItem = lineItems.find(
    (item) => item.price?.id === expectedPriceId && item.quantity === 1,
  );

  if (
    checkoutSession.mode !== "payment" ||
    checkoutSession.status !== "complete" ||
    checkoutSession.payment_status !== "paid" ||
    checkoutSession.currency !== TRAINING_BLOCK_CURRENCY ||
    checkoutSession.amount_total !== expectedAmount ||
    lineItems.length !== 1 ||
    !lineItem ||
    lineItem.amount_subtotal !== expectedAmount ||
    !referenceId ||
    (expectedReferenceId && referenceId !== expectedReferenceId) ||
    (kind === "block" && !trainingBlockId)
  ) {
    return null;
  }

  return {
    purchaseType: kind,
    purchasedAt: checkoutSession.created * 1_000,
    referenceId,
    stripeCheckoutSessionId: checkoutSession.id,
    stripeCustomerId: getStripeId(checkoutSession.customer),
    stripePaymentIntentId: getStripeId(checkoutSession.payment_intent),
    ...(kind === "block" ? { trainingBlockId } : {}),
  };
}

export async function getVerifiedTrainingBlockPurchase({
  checkoutSessionId,
  ctx,
  expectedReferenceId,
  stripeClient,
}: {
  checkoutSessionId: string;
  ctx: GenericCtx<DataModel>;
  expectedReferenceId?: string;
  stripeClient: Stripe;
}): Promise<VerifiedTrainingBlockPurchase | null> {
  if (!checkoutSessionId.startsWith("cs_")) {
    return null;
  }

  const checkoutSession = await stripeClient.checkout.sessions.retrieve(
    checkoutSessionId,
    { expand: ["line_items"] },
  );

  return verifyTrainingBlockCheckoutSession({
    checkoutSession,
    expectedBlockPriceId: getAuthEnvironment(
      ctx,
      "STRIPE_TRAINING_BLOCK_PRICE_ID",
    ),
    expectedBundlePriceId: getAuthEnvironment(
      ctx,
      "STRIPE_TRAINING_BLOCK_BUNDLE_PRICE_ID",
    ),
    expectedReferenceId,
  });
}
