import { describe, expect, test } from "bun:test";
import type Stripe from "stripe";
import { TRAINING_ARCHIVE_PRODUCT_KEY } from "./trainingArchive";
import { verifyTrainingArchiveCheckoutSession } from "./trainingArchiveStripe";

const PRICE_ID = "price_training_archive";

function createCheckoutSession(
  overrides: Partial<Stripe.Checkout.Session> = {},
) {
  return {
    amount_total: 40_000,
    client_reference_id: "user_123",
    created: 1_788_400_800,
    currency: "usd",
    customer: "cus_123",
    id: "cs_test_123",
    line_items: {
      data: [{ price: { id: PRICE_ID }, quantity: 1 }],
    },
    metadata: { purchaseType: TRAINING_ARCHIVE_PRODUCT_KEY },
    mode: "payment",
    payment_intent: "pi_123",
    payment_status: "paid",
    status: "complete",
    ...overrides,
  } as Stripe.Checkout.Session;
}

describe("verifyTrainingArchiveCheckoutSession", () => {
  test("accepts a paid checkout for the exact archive price and user", () => {
    expect(
      verifyTrainingArchiveCheckoutSession({
        checkoutSession: createCheckoutSession(),
        expectedPriceId: PRICE_ID,
        expectedReferenceId: "user_123",
      }),
    ).toEqual({
      purchasedAt: 1_788_400_800_000,
      referenceId: "user_123",
      stripeCheckoutSessionId: "cs_test_123",
      stripeCustomerId: "cus_123",
      stripePaymentIntentId: "pi_123",
    });
  });

  test("rejects an underpaid or different-price checkout", () => {
    expect(
      verifyTrainingArchiveCheckoutSession({
        checkoutSession: createCheckoutSession({ amount_total: 39_999 }),
        expectedPriceId: PRICE_ID,
      }),
    ).toBeNull();
    expect(
      verifyTrainingArchiveCheckoutSession({
        checkoutSession: createCheckoutSession(),
        expectedPriceId: "price_other",
      }),
    ).toBeNull();
  });

  test("rejects unpaid sessions and another user's checkout", () => {
    expect(
      verifyTrainingArchiveCheckoutSession({
        checkoutSession: createCheckoutSession({
          payment_status: "unpaid",
        }),
        expectedPriceId: PRICE_ID,
      }),
    ).toBeNull();
    expect(
      verifyTrainingArchiveCheckoutSession({
        checkoutSession: createCheckoutSession(),
        expectedPriceId: PRICE_ID,
        expectedReferenceId: "user_other",
      }),
    ).toBeNull();
  });
});
