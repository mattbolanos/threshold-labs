import type { GenericCtx } from "@convex-dev/better-auth";
import type Stripe from "stripe";
import type { DataModel } from "../_generated/dataModel";
import { getAuthEnvironment } from "./authEnvironment";
import {
  TRAINING_ARCHIVE_CURRENCY,
  TRAINING_ARCHIVE_PRICE_CENTS,
  TRAINING_ARCHIVE_PRODUCT_KEY,
} from "./trainingArchive";

export interface VerifiedTrainingArchivePurchase {
  purchasedAt: number;
  referenceId: string;
  stripeCheckoutSessionId: string;
  stripeCustomerId?: string;
  stripePaymentIntentId?: string;
}

type TrainingArchiveCheckoutSession = Pick<
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
  | "subscription"
> & {
  line_items?: {
    data: Array<
      Pick<Stripe.LineItem, "amount_subtotal" | "price" | "quantity">
    >;
  };
};

const getStripeId = (value: string | { id: string } | null | undefined) =>
  typeof value === "string" ? value : value?.id;

export function verifyTrainingArchiveCheckoutSession({
  checkoutSession,
  expectedMembershipPriceId,
  expectedPriceId,
  expectedReferenceId,
}: {
  checkoutSession: TrainingArchiveCheckoutSession;
  expectedMembershipPriceId?: string;
  expectedPriceId: string;
  expectedReferenceId?: string;
}): VerifiedTrainingArchivePurchase | null {
  const referenceId =
    checkoutSession.client_reference_id ??
    checkoutSession.metadata?.referenceId;
  const archiveLineItem = checkoutSession.line_items?.data.find(
    (lineItem) =>
      lineItem.price?.id === expectedPriceId && lineItem.quantity === 1,
  );
  const includesMembershipPrice = checkoutSession.line_items?.data.some(
    (lineItem) =>
      lineItem.price?.id === expectedMembershipPriceId &&
      lineItem.quantity === 1,
  );
  const isStandaloneAddOn =
    checkoutSession.mode === "payment" &&
    checkoutSession.amount_total === TRAINING_ARCHIVE_PRICE_CENTS;
  const isMembershipBundle =
    checkoutSession.mode === "subscription" &&
    Boolean(checkoutSession.subscription) &&
    includesMembershipPrice;

  if (
    (!isStandaloneAddOn && !isMembershipBundle) ||
    checkoutSession.status !== "complete" ||
    checkoutSession.payment_status !== "paid" ||
    checkoutSession.metadata?.purchaseType !== TRAINING_ARCHIVE_PRODUCT_KEY ||
    !referenceId ||
    (expectedReferenceId && referenceId !== expectedReferenceId) ||
    !archiveLineItem ||
    archiveLineItem.amount_subtotal !== TRAINING_ARCHIVE_PRICE_CENTS ||
    checkoutSession.currency !== TRAINING_ARCHIVE_CURRENCY
  ) {
    return null;
  }

  return {
    purchasedAt: checkoutSession.created * 1_000,
    referenceId,
    stripeCheckoutSessionId: checkoutSession.id,
    stripeCustomerId: getStripeId(checkoutSession.customer),
    stripePaymentIntentId: getStripeId(checkoutSession.payment_intent),
  };
}

export async function getVerifiedTrainingArchivePurchase({
  checkoutSessionId,
  ctx,
  expectedReferenceId,
  stripeClient,
}: {
  checkoutSessionId: string;
  ctx: GenericCtx<DataModel>;
  expectedReferenceId?: string;
  stripeClient: Stripe;
}): Promise<VerifiedTrainingArchivePurchase | null> {
  if (!checkoutSessionId.startsWith("cs_")) {
    return null;
  }

  const checkoutSession = await stripeClient.checkout.sessions.retrieve(
    checkoutSessionId,
    { expand: ["line_items"] },
  );
  const expectedPriceId = getAuthEnvironment(
    ctx,
    "STRIPE_TRAINING_ARCHIVE_PRICE_ID",
  );
  const expectedMembershipPriceId = getAuthEnvironment(
    ctx,
    "STRIPE_INSIDE_LAB_PRICE_ID",
  );

  return verifyTrainingArchiveCheckoutSession({
    checkoutSession,
    expectedMembershipPriceId,
    expectedPriceId,
    expectedReferenceId,
  });
}
