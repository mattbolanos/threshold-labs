import { afterEach, beforeEach, expect, mock, spyOn, test } from "bun:test";
import { type FunctionReference, getFunctionName } from "convex/server";
import type Stripe from "stripe";
import type { ActionCtx, MutationCtx } from "./_generated/server";
import { authComponent } from "./auth";
import {
  getAdminPrice,
  getApprovedPrice,
  getCheckoutPrice,
  getCurrent,
  publishPrice,
} from "./bundlePricing";
import { type BundlePrice, changeBundlePrice } from "./lib/bundlePricing";
import { TRAINING_BLOCK_BUNDLE_PURCHASE_TYPE } from "./lib/trainingBlockPurchases";
import { getVerifiedTrainingBlockPurchase } from "./lib/trainingBlockStripe";

type PriceRow = BundlePrice & { createdAt?: number; createdByUserId?: string };
const admin = { _id: "admin-1", role: "admin" } as NonNullable<
  Awaited<ReturnType<typeof authComponent.safeGetAuthUser>>
>;
const env = {
  PREVIEW_AUTH_BYPASS: "false",
  STRIPE_TRAINING_BLOCK_BUNDLE_PRICE_ID: "price_original",
  STRIPE_TRAINING_BLOCK_PRICE_ID: "price_block",
  VERCEL_ENV: "production",
};
const originalEnv = Object.fromEntries(
  Object.keys(env).map((key) => [key, process.env[key]]),
);
let auth: ReturnType<typeof spyOn<typeof authComponent, "safeGetAuthUser">>;

beforeEach(() => {
  Object.assign(process.env, env);
  auth = spyOn(authComponent, "safeGetAuthUser").mockResolvedValue(admin);
});
afterEach(() => {
  auth.mockRestore();
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function handler(fn: unknown) {
  return (
    fn as { _handler: (ctx: MutationCtx, args: never) => Promise<unknown> }
  )._handler;
}

function harness() {
  let rows: PriceRow[] = [];
  const functions: Record<string, unknown> = {
    "bundlePricing:getApprovedPrice": getApprovedPrice,
    "bundlePricing:getCheckoutPrice": getCheckoutPrice,
    "bundlePricing:publishPrice": publishPrice,
  };
  const ctx = {
    db: {
      insert: async (_table: string, row: PriceRow) => {
        rows.push(row);
        return `row-${rows.length}`;
      },
      query: () => {
        let selected = rows.slice();
        const query = {
          first: async () => selected[0] ?? null,
          order: () => {
            selected.sort((a, b) => b.revision - a.revision);
            return query;
          },
          unique: async () => {
            if (selected.length > 1) throw new Error("Duplicate price");
            return selected[0] ?? null;
          },
          withIndex: (_index: string, filter?: (q: unknown) => void) => {
            filter?.({
              eq: (field: keyof PriceRow, value: unknown) => {
                selected = selected.filter((row) => row[field] === value);
              },
            });
            return query;
          },
        };
        return query;
      },
    },
    runMutation: async (ref: FunctionReference<"mutation">, args: never) => {
      const before = structuredClone(rows);
      try {
        return await handler(functions[getFunctionName(ref)])(ctx, args);
      } catch (error) {
        rows = before;
        throw error;
      }
    },
    runQuery: async (ref: FunctionReference<"query">, args: never) =>
      handler(functions[getFunctionName(ref)])(ctx, args),
  } as unknown as MutationCtx & ActionCtx;
  const retrieve = mock(async () => ({
    active: true,
    currency: "usd",
    id: "price_original",
    product: { active: true, id: "prod_bundle" },
    tax_behavior: "exclusive",
    type: "one_time",
    unit_amount: 40_000,
  }));
  const create = mock(
    async (
      _params: Stripe.PriceCreateParams,
      _options: Stripe.RequestOptions,
    ) => ({ id: "price_500" }),
  );
  const stripe = { prices: { create, retrieve } } as unknown as Stripe;
  return { create, ctx, retrieve, rows: () => rows, stripe };
}

const run = async (fn: unknown, ctx: MutationCtx, args = {}) =>
  handler(fn)(ctx, args as never);
const update = (
  h: ReturnType<typeof harness>,
  amountCents = 50_000,
  expectedRevision = 0,
) => changeBundlePrice(h.ctx, { amountCents, expectedRevision }, h.stripe);

test("empty pricing uses the $400 bootstrap and public output omits Stripe details", async () => {
  const h = harness();
  expect(await run(getCheckoutPrice, h.ctx)).toEqual({
    amountCents: 40_000,
    revision: 0,
    stripePriceId: "price_original",
  });
  expect(await run(getCurrent, h.ctx)).toEqual({
    amountCents: 40_000,
    currency: "usd",
  });
  expect(
    await run(getApprovedPrice, h.ctx, { stripePriceId: "price_unknown" }),
  ).toBeNull();
});

test.each([undefined, { ...admin, role: "client" }])(
  "non-admin cannot change prices or read admin settings",
  async (user) => {
    auth.mockResolvedValue(user);
    const h = harness();
    await expect(update(h)).rejects.toThrow("Administrator access");
    await expect(run(getAdminPrice, h.ctx)).rejects.toThrow(
      "Administrator access",
    );
    expect(h.retrieve).not.toHaveBeenCalled();
    expect(h.create).not.toHaveBeenCalled();
    expect(h.rows()).toEqual([]);
  },
);

test("anonymous preview bypass cannot create a Stripe price", async () => {
  process.env.PREVIEW_AUTH_BYPASS = "true";
  const h = harness();
  expect(await run(getAdminPrice, h.ctx)).toMatchObject({ canEdit: false });
  await expect(update(h)).rejects.toThrow("Sign in as an admin");
  expect(h.create).not.toHaveBeenCalled();
});

test.each([
  0,
  -100,
  99,
  500.5,
  Number.NaN,
  Number.POSITIVE_INFINITY,
  100_000_000,
])("rejects invalid amount %s before Stripe", async (amount) => {
  const h = harness();
  await expect(update(h, amount)).rejects.toThrow("Enter a price");
  expect(h.retrieve).not.toHaveBeenCalled();
});

test("$400 to $500 reuses the product, publishes the new price, and records the admin", async () => {
  const h = harness();
  expect(await update(h)).toEqual({
    amountCents: 50_000,
    revision: 1,
    stripePriceId: "price_500",
  });
  expect(h.create).toHaveBeenCalledWith(
    {
      currency: "usd",
      product: "prod_bundle",
      tax_behavior: "exclusive",
      unit_amount: 50_000,
    },
    { idempotencyKey: expect.stringContaining(":0:price_original:50000") },
  );
  expect(await run(getCurrent, h.ctx)).toEqual({
    amountCents: 50_000,
    currency: "usd",
  });
  expect(h.rows()).toHaveLength(2);
  expect(h.rows()[1]).toMatchObject({
    createdAt: expect.any(Number),
    createdByUserId: "admin-1",
  });
  process.env.STRIPE_TRAINING_BLOCK_BUNDLE_PRICE_ID = "price_reconfigured";
  expect(
    await run(getApprovedPrice, h.ctx, { stripePriceId: "price_original" }),
  ).toMatchObject({ amountCents: 40_000 });
  expect(
    await run(getApprovedPrice, h.ctx, { stripePriceId: "price_reconfigured" }),
  ).toBeNull();
});

test("a Stripe failure leaves the current price and history unchanged", async () => {
  const h = harness();
  h.create.mockRejectedValue(new Error("Stripe unavailable"));
  await expect(update(h)).rejects.toThrow("Stripe unavailable");
  expect(await run(getCurrent, h.ctx)).toMatchObject({ amountCents: 40_000 });
  expect(h.rows()).toEqual([]);
});

test("invalid Stripe configuration cannot publish a new price", async () => {
  const h = harness();
  const original = await h.retrieve();
  for (const patch of [
    { currency: "eur" },
    { type: "recurring" },
    { unit_amount: 100 },
    { product: { active: false, id: "prod_bundle" } },
  ]) {
    h.retrieve.mockResolvedValue({ ...original, ...patch });
    await expect(update(h)).rejects.toThrow("Stripe product needs attention");
  }
  expect(h.create).not.toHaveBeenCalled();
  expect(h.rows()).toEqual([]);
});

test("retrying the saved amount does not create a duplicate price", async () => {
  const h = harness();
  const first = await update(h);
  expect(await update(h)).toEqual(first);
  expect(h.create).toHaveBeenCalledTimes(1);
  expect(h.rows()).toHaveLength(2);
});

test("stale editor cannot overwrite an admin's newer price", async () => {
  const h = harness();
  await update(h);
  await expect(update(h, 60_000)).rejects.toThrow("Refresh and try again");
  expect(h.create).toHaveBeenCalledTimes(1);
  expect(await run(getCurrent, h.ctx)).toMatchObject({ amountCents: 50_000 });
});

test("an edit committed during the Stripe request wins; the unused Stripe price is not approved", async () => {
  const h = harness();
  h.create.mockImplementation(async () => {
    await run(publishPrice, h.ctx, {
      amountCents: 60_000,
      expectedRevision: 0,
      stripePriceId: "price_600",
    });
    return { id: "price_500" };
  });
  await expect(update(h)).rejects.toThrow("Refresh and try again");
  expect(await run(getCurrent, h.ctx)).toMatchObject({ amountCents: 60_000 });
  expect(
    await run(getApprovedPrice, h.ctx, { stripePriceId: "price_500" }),
  ).toBeNull();
});

test("admin access is checked again before publishing", async () => {
  const h = harness();
  h.create.mockImplementation(async () => {
    auth.mockResolvedValue({ ...admin, role: "client" });
    return { id: "price_500" };
  });
  await expect(update(h)).rejects.toThrow("Administrator access");
  expect(h.rows()).toEqual([]);
});

test("successive changes retain each approved price, including returning to $400", async () => {
  const h = harness();
  await update(h);
  h.retrieve.mockResolvedValue({
    ...(await h.retrieve()),
    id: "price_500",
    unit_amount: 50_000,
  });
  h.create.mockResolvedValue({ id: "price_400_again" });
  await update(h, 40_000, 1);
  expect(await run(getCheckoutPrice, h.ctx)).toMatchObject({
    amountCents: 40_000,
    revision: 2,
    stripePriceId: "price_400_again",
  });
  expect(h.rows()).toHaveLength(3);
  expect(
    await run(getApprovedPrice, h.ctx, { stripePriceId: "price_500" }),
  ).toMatchObject({ amountCents: 50_000 });
});

test("after a price increase, paid old and new checkouts verify at their original amounts", async () => {
  const h = harness();
  await update(h);
  async function verify(priceId: string, amount: number, overrides = {}) {
    const session = {
      amount_total: amount,
      client_reference_id: "buyer",
      created: 1788400800,
      currency: "usd",
      id: "cs_paid",
      line_items: {
        data: [
          { amount_subtotal: amount, price: { id: priceId }, quantity: 1 },
        ],
      },
      metadata: { purchaseType: TRAINING_BLOCK_BUNDLE_PURCHASE_TYPE },
      mode: "payment",
      payment_status: "paid",
      status: "complete",
      ...overrides,
    };
    const stripe = {
      checkout: { sessions: { retrieve: async () => session } },
    } as unknown as Stripe;
    return getVerifiedTrainingBlockPurchase({
      checkoutSessionId: "cs_paid",
      ctx: h.ctx,
      expectedReferenceId: "buyer",
      stripeClient: stripe,
    });
  }
  expect(await verify("price_original", 40_000)).toMatchObject({
    purchaseType: "bundle",
  });
  expect(await verify("price_500", 50_000)).toMatchObject({
    purchaseType: "bundle",
  });
  expect(await verify("price_original", 50_000)).toBeNull();
  expect(await verify("price_500", 40_000)).toBeNull();
  expect(await verify("price_unknown", 50_000)).toBeNull();
  expect(await verify("price_500", 50_000, { currency: "eur" })).toBeNull();
  expect(
    await verify("price_500", 50_000, { client_reference_id: "another-buyer" }),
  ).toBeNull();
  expect(
    await verify("price_500", 50_000, { payment_status: "unpaid" }),
  ).toBeNull();
  expect(
    await verify("price_500", 50_000, {
      line_items: {
        data: [
          { amount_subtotal: 50_000, price: { id: "price_500" }, quantity: 2 },
        ],
      },
    }),
  ).toBeNull();
});
