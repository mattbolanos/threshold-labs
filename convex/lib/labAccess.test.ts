import { describe, expect, test } from "bun:test";
import { hasActiveLabSubscription } from "./labAccess";

describe("hasActiveLabSubscription", () => {
  test.each(["active", "trialing"])(
    "grants access to a Stripe subscription with %s status",
    (status) => {
      expect(
        hasActiveLabSubscription([
          { status, stripeSubscriptionId: "sub_inside_the_lab" },
        ]),
      ).toBe(true);
    },
  );

  test.each(["canceled", "incomplete", "past_due", "unpaid"])(
    "denies access to a Stripe subscription with %s status",
    (status) => {
      expect(
        hasActiveLabSubscription([
          { status, stripeSubscriptionId: "sub_inside_the_lab" },
        ]),
      ).toBe(false);
    },
  );

  test("denies access when Stripe has not created a subscription", () => {
    expect(hasActiveLabSubscription([{ status: "active" }])).toBe(false);
    expect(hasActiveLabSubscription([])).toBe(false);
  });
});
