import { describe, expect, mock, test } from "bun:test";
import type { DBAdapter } from "better-auth";
import Stripe from "stripe";
import { ensureStripeCustomer } from "./stripeCustomer";

const user = {
  email: "member@example.com",
  id: "google-user",
  name: "New Member",
};

function setup(retrieveResult: object | Error = { id: "cus_existing" }) {
  const retrieve = mock(async () => {
    if (retrieveResult instanceof Error) throw retrieveResult;
    return retrieveResult;
  });
  const create = mock(async () => ({ id: "cus_new" }));
  const update = mock(async () => null);
  const updateMany = mock(async () => 1);
  const stripe = { customers: { create, retrieve } } as unknown as Stripe;
  const adapter = { update, updateMany } as unknown as DBAdapter;
  return { adapter, create, retrieve, stripe, update, updateMany };
}

describe("checkout billing customer", () => {
  test("creates and saves a customer for a new Google account without signup", async () => {
    const fixtures = setup();
    expect(
      await ensureStripeCustomer(fixtures.stripe, fixtures.adapter, user),
    ).toBe("cus_new");
    expect(fixtures.retrieve).not.toHaveBeenCalled();
    expect(fixtures.create).toHaveBeenCalledWith(
      {
        email: user.email,
        metadata: { customerType: "user", userId: user.id },
        name: user.name,
      },
      { idempotencyKey: "threshold-customer-google-user-new" },
    );
    expect(fixtures.update).toHaveBeenCalledWith({
      model: "user",
      update: { stripeCustomerId: "cus_new" },
      where: [{ field: "id", value: user.id }],
    });
  });

  test("reuses an existing customer without changing billing records", async () => {
    const fixtures = setup();
    expect(
      await ensureStripeCustomer(fixtures.stripe, fixtures.adapter, {
        ...user,
        stripeCustomerId: "cus_existing",
      }),
    ).toBe("cus_existing");
    expect(fixtures.create).not.toHaveBeenCalled();
    expect(fixtures.update).not.toHaveBeenCalled();
    expect(fixtures.updateMany).not.toHaveBeenCalled();
  });

  for (const [label, result] of [
    [
      "missing",
      new Stripe.errors.StripeInvalidRequestError({
        code: "resource_missing",
        message: "No such customer: 'cus_old'",
        param: "id",
      }),
    ],
    ["deleted", { deleted: true, id: "cus_old" }],
  ] as const) {
    test(`repairs a ${label} customer and its unfinished checkout`, async () => {
      const fixtures = setup(result);
      expect(
        await ensureStripeCustomer(fixtures.stripe, fixtures.adapter, {
          ...user,
          stripeCustomerId: "cus_old",
        }),
      ).toBe("cus_new");
      expect(fixtures.updateMany).toHaveBeenCalledWith({
        model: "subscription",
        update: { stripeCustomerId: "cus_new" },
        where: [
          { field: "referenceId", value: user.id },
          { field: "stripeCustomerId", value: "cus_old" },
          { field: "status", value: "incomplete" },
        ],
      });
      expect(fixtures.create).toHaveBeenCalledWith(expect.anything(), {
        idempotencyKey: "threshold-customer-google-user-cus_old",
      });
    });
  }

  for (const error of [
    new Stripe.errors.StripeConnectionError({ message: "Connection failed" }),
    new Stripe.errors.StripeAuthenticationError({ message: "Invalid API key" }),
    new Stripe.errors.StripeRateLimitError({ message: "Too many requests" }),
    new Stripe.errors.StripeInvalidRequestError({
      code: "resource_missing",
      message: "Another resource is missing",
      param: "other",
    }),
  ]) {
    test(`does not replace a customer on ${error.type}: ${error.message}`, async () => {
      const fixtures = setup(error);
      await expect(
        ensureStripeCustomer(fixtures.stripe, fixtures.adapter, {
          ...user,
          stripeCustomerId: "cus_existing",
        }),
      ).rejects.toBe(error);
      expect(fixtures.create).not.toHaveBeenCalled();
      expect(fixtures.update).not.toHaveBeenCalled();
    });
  }
});
