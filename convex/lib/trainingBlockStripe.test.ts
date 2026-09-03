import { describe, expect, test } from "bun:test";
import type Stripe from "stripe";
import {
  TRAINING_BLOCK_BUNDLE_PURCHASE_TYPE,
  TRAINING_BLOCK_PURCHASE_TYPE,
} from "./trainingBlockPurchases";
import { verifyTrainingBlockCheckoutSession } from "./trainingBlockStripe";

const BLOCK_PRICE_ID = "price_training_block";
const BUNDLE_PRICE_ID = "price_training_block_bundle";
const BLOCK_ID = "jx72qy25bxqvxafaj8z5kjp1dn8dqe6z";

function createCheckoutSession(
  overrides: Partial<Stripe.Checkout.Session> = {},
) {
  return {
    amount_total: 10_000,
    client_reference_id: "user_123",
    created: 1_788_400_800,
    currency: "usd",
    customer: "cus_123",
    id: "cs_test_123",
    line_items: {
      data: [
        { amount_subtotal: 10_000, price: { id: BLOCK_PRICE_ID }, quantity: 1 },
      ],
    },
    metadata: {
      purchaseType: TRAINING_BLOCK_PURCHASE_TYPE,
      trainingBlockId: BLOCK_ID,
    },
    mode: "payment",
    payment_intent: "pi_123",
    payment_status: "paid",
    status: "complete",
    ...overrides,
  } as Stripe.Checkout.Session;
}

const verify = (
  checkoutSession: Stripe.Checkout.Session,
  expectedReferenceId = "user_123",
) =>
  verifyTrainingBlockCheckoutSession({
    checkoutSession,
    expectedBlockPriceId: BLOCK_PRICE_ID,
    expectedBundlePriceId: BUNDLE_PRICE_ID,
    expectedReferenceId,
  });

describe("verifyTrainingBlockCheckoutSession", () => {
  test("accepts a paid single-block checkout for the exact price and user", () => {
    expect(verify(createCheckoutSession())).toEqual({
      purchaseType: "block",
      purchasedAt: 1_788_400_800_000,
      referenceId: "user_123",
      stripeCheckoutSessionId: "cs_test_123",
      stripeCustomerId: "cus_123",
      stripePaymentIntentId: "pi_123",
      trainingBlockId: BLOCK_ID,
    });
  });

  test("accepts a paid bundle checkout without a block id", () => {
    expect(
      verify(
        createCheckoutSession({
          amount_total: 40_000,
          line_items: {
            data: [
              {
                amount_subtotal: 40_000,
                price: { id: BUNDLE_PRICE_ID },
                quantity: 1,
              },
            ],
          } as Stripe.ApiList<Stripe.LineItem>,
          metadata: { purchaseType: TRAINING_BLOCK_BUNDLE_PURCHASE_TYPE },
        }),
      ),
    ).toMatchObject({ purchaseType: "bundle", referenceId: "user_123" });
  });

  test("rejects a single block without a block id", () => {
    expect(
      verify(
        createCheckoutSession({
          metadata: { purchaseType: TRAINING_BLOCK_PURCHASE_TYPE },
        }),
      ),
    ).toBeNull();
  });

  test("rejects the wrong price for the declared purchase type", () => {
    expect(
      verify(
        createCheckoutSession({
          metadata: { purchaseType: TRAINING_BLOCK_BUNDLE_PURCHASE_TYPE },
        }),
      ),
    ).toBeNull();
  });

  test.each([
    { amount_total: 5_000 },
    { currency: "eur" },
    { mode: "subscription" },
    { payment_status: "unpaid" },
    { status: "open" },
    { metadata: { purchaseType: "something-else" } },
  ] as Partial<Stripe.Checkout.Session>[])(
    "rejects an invalid session %j",
    (overrides) => {
      expect(verify(createCheckoutSession(overrides))).toBeNull();
    },
  );

  test("rejects a session that belongs to another user", () => {
    expect(verify(createCheckoutSession(), "user_456")).toBeNull();
  });

  test("falls back to metadata for the reference id", () => {
    expect(
      verify(
        createCheckoutSession({
          client_reference_id: null,
          metadata: {
            purchaseType: TRAINING_BLOCK_PURCHASE_TYPE,
            referenceId: "user_123",
            trainingBlockId: BLOCK_ID,
          },
        }),
      )?.referenceId,
    ).toBe("user_123");
  });
});
