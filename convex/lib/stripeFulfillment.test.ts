import { afterAll, beforeEach, expect, mock, test } from "bun:test";
import { type FunctionReference, getFunctionName } from "convex/server";
import type Stripe from "stripe";
import type { MutationCtx } from "../_generated/server";
import { markDiscountCodesRedeemed } from "../discountCodes";
import { applySubscription, beginReconciliation } from "../stripeSubscriptions";
import { syncMembershipAccessWindow } from "../subscriptionAccess";
import { grantPurchase } from "../trainingBlockPurchases";
import { hasActiveLabSubscription } from "./labAccess";
import { createStripeAuthPlugin } from "./stripeAuth";
import { reconcileStripeSubscription } from "./stripeFulfillment";
import { TRAINING_BLOCK_PURCHASE_TYPE } from "./trainingBlockPurchases";

type Row = Record<string, unknown>;
type Where = { field: string; value: unknown };
type Lookup = { model: string; where: Where[] };
const env = {
  SITE_URL: "https://example.com",
  STRIPE_INSIDE_LAB_PRICE_ID: "price_membership",
  STRIPE_SECRET_KEY: "sk_test_offline_only",
  STRIPE_TRAINING_BLOCK_BUNDLE_PRICE_ID: "price_bundle",
  STRIPE_TRAINING_BLOCK_PRICE_ID: "price_block",
  STRIPE_WEBHOOK_SECRET: "whsec_offline_only",
};
const originalEnv = Object.fromEntries(
  Object.keys(env).map((key) => [key, process.env[key]]),
);
beforeEach(() => Object.assign(process.env, env));
afterAll(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function stripeSubscription(overrides: Row = {}): Stripe.Subscription {
  return {
    cancel_at: null,
    cancel_at_period_end: false,
    canceled_at: null,
    created: 1788868800,
    customer: "cus_member",
    discounts: [],
    ended_at: null,
    id: "sub_member",
    items: {
      data: [
        {
          current_period_end: 1791460800,
          current_period_start: 1788868800,
          id: "si_member",
          price: { id: "price_membership", recurring: { interval: "month" } },
          quantity: 1,
        },
      ],
    },
    metadata: { referenceId: "member", subscriptionId: "pending" },
    schedule: null,
    status: "active",
    trial_end: null,
    trial_start: null,
    ...overrides,
  } as unknown as Stripe.Subscription;
}

function handler(fn: unknown) {
  return (
    fn as {
      _handler: (ctx: MutationCtx, args: unknown) => Promise<unknown>;
    }
  )._handler;
}

/** Models Convex's serialized mutations and rollback, including nested calls. */
function harness() {
  let state: Record<string, Map<string, Row>> = {};
  let queue = Promise.resolve<unknown>(null);
  let sequence = 0;
  let failRedemption = false;
  const table = (name: string) => {
    state[name] ??= new Map();
    return state[name];
  };
  const insert = async (name: string, row: Row) => {
    const id = `${name}-${++sequence}`;
    table(name).set(id, { ...row, _id: id });
    return id;
  };
  const patch = async (id: string, update: Row) => {
    const rows = Object.values(state).find((rows) => rows.has(id));
    if (!rows) throw new Error(`Missing row ${id}`);
    rows.set(id, { ...rows.get(id), ...update });
  };
  const find = ({ model, where }: Lookup) =>
    [...table(model).values()].find((row) =>
      where.every(({ field, value }) => row[field] === value),
    ) ?? null;
  const mutations: Record<string, ReturnType<typeof handler>> = {
    "discountCodes:markDiscountCodesRedeemed": handler(
      markDiscountCodesRedeemed,
    ),
    "stripeSubscriptions:applySubscription": handler(applySubscription),
    "stripeSubscriptions:beginReconciliation": handler(beginReconciliation),
    "subscriptionAccess:syncMembershipAccessWindow": handler(
      syncMembershipAccessWindow,
    ),
    "trainingBlockPurchases:grantPurchase": handler(grantPurchase),
  };
  const runMutation = async (
    reference: unknown,
    args: unknown,
  ): Promise<unknown> => {
    const input = (args as { input?: Lookup & { data?: Row; update?: Row } })
      .input;
    if (input) {
      if (input.data) return await insert(input.model, input.data);
      const row = find(input);
      if (!row) throw new Error("Auth subscription missing");
      await patch(String(row._id), input.update ?? {});
      return row;
    }
    const name = getFunctionName(reference as FunctionReference<"mutation">);
    if (name === "discountCodes:markDiscountCodesRedeemed" && failRedemption) {
      throw new Error("Simulated redemption failure");
    }
    return await mutations[name](mutationCtx, args);
  };
  const mutationCtx = {
    db: {
      get: async (id: string) =>
        Object.values(state)
          .find((rows) => rows.has(id))
          ?.get(id) ?? null,
      insert,
      normalizeId: (_table: string, id: string) => id,
      patch,
      query: (name: string) => {
        const filters: Array<(row: Row) => boolean> = [];
        const q = {
          eq: (field: string, value: unknown) => {
            filters.push((row) => row[field] === value);
            return q;
          },
          lte: (field: string, value: string) => {
            filters.push((row) => String(row[field]) <= value);
            return q;
          },
        };
        const rows = () =>
          [...table(name).values()].filter((row) =>
            filters.every((f) => f(row)),
          );
        const query = {
          collect: async () => rows(),
          first: async () => rows()[0] ?? null,
          order: () => query,
          unique: async () => rows()[0] ?? null,
          withIndex: (
            _index: string,
            filter: (builder: typeof q) => unknown,
          ) => {
            filter(q);
            return query;
          },
        };
        return query;
      },
    },
    runMutation,
    runQuery: async (_reference: unknown, lookup: Lookup) => find(lookup),
  } as unknown as MutationCtx;
  const ctx = {
    runMutation: async (reference: unknown, args: unknown) => {
      const result = queue.then(async () => {
        const before = structuredClone(state);
        try {
          return await runMutation(reference, args);
        } catch (error) {
          state = before;
          throw error;
        }
      });
      queue = result.catch(() => null);
      return result;
    },
  } as unknown as MutationCtx;
  table("user").set("member", {
    _id: "member",
    email: "member@example.com",
    stripeCustomerId: "cus_member",
  });
  table("subscription").set("pending", {
    _id: "pending",
    plan: "inside-the-lab",
    referenceId: "member",
    status: "incomplete",
  });
  const plugin = createStripeAuthPlugin(ctx);
  const stripeClient = plugin.options.stripeClient;
  const retrieve = mock(async (_id: string) => stripeSubscription());
  stripeClient.subscriptions.retrieve =
    retrieve as unknown as typeof stripeClient.subscriptions.retrieve;
  const legacyWrite = mock(() => {
    throw new Error("Legacy webhook handler ran");
  });
  const deliver = async (
    type: string,
    object: Row,
    signatureValid = true,
  ): Promise<unknown> => {
    const body = JSON.stringify({
      created: 1789214400,
      data: { object },
      id: "evt_test",
      type,
    });
    const signature = await stripeClient.webhooks.generateTestHeaderStringAsync(
      {
        payload: body,
        secret: signatureValid ? env.STRIPE_WEBHOOK_SECRET : "wrong_secret",
      },
    );
    return await plugin.endpoints.stripeWebhook({
      context: {
        adapter: { findOne: legacyWrite, update: legacyWrite },
        logger: { error: mock(), warn: mock() },
      },
      request: new Request(`${env.SITE_URL}/api/auth/stripe/webhook`, {
        body,
        headers: { "stripe-signature": signature },
        method: "POST",
      }),
    } as never);
  };
  return {
    ctx,
    deliver,
    legacyWrite,
    retrieve,
    setFailure: (value: boolean) => {
      failRedemption = value;
    },
    stripeClient,
    table,
  };
}

test("old active webhook uses current canceled Stripe state without any legacy writes", async () => {
  const h = harness();
  const canceled = stripeSubscription({
    ended_at: 1789214400,
    status: "canceled",
  });
  h.retrieve.mockResolvedValue(canceled);
  await h.deliver("customer.subscription.deleted", canceled as unknown as Row);
  await h.deliver(
    "customer.subscription.updated",
    stripeSubscription() as unknown as Row,
  );
  const sub = h.table("subscription").get("pending");
  expect(sub?.status).toBe("canceled");
  expect(hasActiveLabSubscription([sub ?? {}])).toBe(false);
  expect([...h.table("membershipAccessWindows").values()][0]?.accessEnd).toBe(
    "2026-09-12",
  );
  expect(h.legacyWrite).not.toHaveBeenCalled();
});

test("a superseded in-flight Stripe read cannot restore access, and its retry succeeds", async () => {
  const h = harness();
  let release!: (value: Stripe.Subscription) => void;
  let started!: () => void;
  const reading = new Promise<void>((resolve) => {
    started = resolve;
  });
  h.retrieve.mockImplementationOnce(async () => {
    started();
    return await new Promise((resolve) => {
      release = resolve;
    });
  });
  const old = h.deliver(
    "customer.subscription.updated",
    stripeSubscription() as unknown as Row,
  );
  await reading;
  h.retrieve.mockResolvedValue(
    stripeSubscription({ ended_at: 1789214400, status: "canceled" }),
  );
  await h.deliver("customer.subscription.deleted", {
    id: "sub_member",
    status: "canceled",
  });
  release(stripeSubscription());
  await expect(old).rejects.toMatchObject({ status: "BAD_REQUEST" });
  expect(h.table("subscription").get("pending")?.status).toBe("canceled");
  await expect(
    h.deliver("customer.subscription.updated", {
      id: "sub_member",
      status: "active",
    }),
  ).resolves.toEqual({ success: true });
  expect(h.table("subscription").get("pending")?.status).toBe("canceled");
});

test("checkout fulfillment failure returns non-2xx and retry atomically grants history", async () => {
  const h = harness();
  h.table("discountCodes").set("offer", {
    _id: "offer",
    status: "active",
    stripePromotionCodeId: "promo_test",
    updatedAt: 0,
  });
  h.retrieve.mockResolvedValue(
    stripeSubscription({
      discounts: [{ id: "di_test", promotion_code: "promo_test" }],
    }),
  );
  h.setFailure(true);
  const checkout = {
    customer_details: { email: "member@example.com" },
    id: "cs_test",
    mode: "subscription",
    subscription: "sub_member",
  };
  await expect(
    h.deliver("checkout.session.completed", checkout),
  ).rejects.toMatchObject({ status: "BAD_REQUEST" });
  expect(h.table("subscription").get("pending")?.status).toBe("incomplete");
  expect(h.table("membershipAccessWindows").size).toBe(0);
  h.setFailure(false);
  await expect(
    h.deliver("checkout.session.completed", checkout),
  ).resolves.toEqual({ success: true });
  expect(h.table("subscription").get("pending")?.status).toBe("active");
  expect([...h.table("membershipAccessWindows").values()][0]?.accessStart).toBe(
    "2025-09-01",
  );
});

test("subscription.created binds the pending checkout record before checkout completes", async () => {
  const h = harness();
  await h.deliver(
    "customer.subscription.created",
    stripeSubscription() as unknown as Row,
  );
  expect(h.table("subscription").get("pending")?.stripeSubscriptionId).toBe(
    "sub_member",
  );
  await h.deliver("checkout.session.completed", {
    id: "cs_test",
    mode: "subscription",
    subscription: "sub_member",
  });
  expect(h.table("subscription").size).toBe(1);
  expect(h.table("membershipAccessWindows").size).toBe(1);
});

test("reconciliation repairs known memberships without a webhook and rejects bad signatures", async () => {
  const h = harness();
  await expect(
    h.deliver("customer.subscription.created", { id: "sub_member" }, false),
  ).rejects.toMatchObject({ status: "BAD_REQUEST" });
  expect(h.retrieve).not.toHaveBeenCalled();
  await expect(
    reconcileStripeSubscription(h.ctx, h.stripeClient, "sub_member"),
  ).resolves.toEqual({ referenceId: "member", status: "synced" });
  expect(h.table("membershipAccessWindows").size).toBe(1);
});

test("an admin-observed redemption is enriched by later subscription reconciliation", async () => {
  const h = harness();
  h.table("discountCodes").set("offer", {
    _id: "offer",
    redeemedAt: 1789214400000,
    status: "redeemed",
    stripePromotionCodeId: "promo_test",
    updatedAt: 1789214400000,
  });
  h.retrieve.mockResolvedValue(
    stripeSubscription({
      discounts: [{ id: "di_test", promotion_code: "promo_test" }],
    }),
  );
  await reconcileStripeSubscription(h.ctx, h.stripeClient, "sub_member");
  const offer = h.table("discountCodes").get("offer");
  expect(offer?.stripeSubscriptionId).toBe("sub_member");
  expect(offer?.redeemedByEmail).toBe("member@example.com");
  expect(offer?.redeemedAt).toBe(1789214400000);
  expect([...h.table("membershipAccessWindows").values()][0]?.accessStart).toBe(
    "2025-09-01",
  );
});

test("foreign deployment metadata cannot create an orphan local membership", async () => {
  const h = harness();
  h.retrieve.mockResolvedValue(
    stripeSubscription({
      customer: "cus_other",
      metadata: {
        referenceId: "foreign_member",
        subscriptionId: "foreign_pending",
      },
    }),
  );
  await expect(
    reconcileStripeSubscription(h.ctx, h.stripeClient, "sub_member"),
  ).resolves.toEqual({ referenceId: null, status: "ignored" });
  expect(h.table("subscription").size).toBe(1);
  expect(h.table("membershipAccessWindows").size).toBe(0);
});

test("async payment success grants a paid block once through the same verified fulfillment", async () => {
  const h = harness();
  h.table("trainingBlocks").set("block", {
    _id: "block",
    endDate: "2026-08-31",
    startDate: "2026-08-01",
    title: "August",
  });
  let paid = false;
  h.stripeClient.checkout.sessions.retrieve = mock(async () => ({
    amount_total: 10000,
    client_reference_id: "member",
    created: 1789214400,
    currency: "usd",
    customer: "cus_member",
    id: "cs_block",
    line_items: {
      data: [
        { amount_subtotal: 10000, price: { id: "price_block" }, quantity: 1 },
      ],
    },
    metadata: {
      purchaseType: TRAINING_BLOCK_PURCHASE_TYPE,
      trainingBlockId: "block",
    },
    mode: "payment",
    payment_intent: "pi_block",
    payment_status: paid ? "paid" : "unpaid",
    status: "complete",
  })) as unknown as typeof h.stripeClient.checkout.sessions.retrieve;
  const checkout = { id: "cs_block", mode: "payment" };
  await h.deliver("checkout.session.completed", checkout);
  expect(h.table("trainingBlockPurchases").size).toBe(0);
  paid = true;
  await h.deliver("checkout.session.async_payment_succeeded", checkout);
  await h.deliver("checkout.session.async_payment_succeeded", checkout);
  expect(h.table("trainingBlockPurchases").size).toBe(1);
});
