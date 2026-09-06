import { describe, expect, test } from "bun:test";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import type { Doc as AuthDoc } from "../betterAuth/_generated/dataModel";
import { describeAdminUser, getAdminUsers } from "./adminUsers";

const user: AuthDoc<"user"> = {
  _creationTime: 1,
  _id: "user-1" as AuthDoc<"user">["_id"],
  createdAt: 1,
  email: "member@example.com",
  emailVerified: true,
  name: "Member",
  updatedAt: 1,
};
const subscription: AuthDoc<"subscription"> = {
  _creationTime: Date.UTC(2026, 8, 1),
  _id: "subscription-1" as AuthDoc<"subscription">["_id"],
  periodEnd: Date.UTC(2026, 9, 1),
  plan: "inside-the-lab",
  referenceId: user._id,
  status: "active",
  stripeSubscriptionId: "sub_1",
};
const purchase: Doc<"trainingBlockPurchases"> = {
  _creationTime: 1,
  _id: "purchase-1" as Doc<"trainingBlockPurchases">["_id"],
  accessEnd: "2026-02-28",
  accessStart: "2026-01-01",
  purchasedAt: Date.UTC(2026, 2, 1),
  purchaseType: "bundle",
  referenceId: user._id,
  stripeCheckoutSessionId: "cs_1",
  trainingBlockId: "block-1" as Doc<"trainingBlocks">["_id"],
  trainingBlockTitle: "Winter training",
};

describe("admin user access", () => {
  test("keeps block access when membership is canceled and dates are in the past", () => {
    const result = describeAdminUser(
      user,
      [{ ...subscription, status: "canceled" }],
      [purchase],
      [],
    );
    expect(result.accessSource).toBe("training_blocks");
    expect(result.subscription?.accessStart).toBeNull();
    expect(result.purchases[0]).toMatchObject({
      accessEnd: "2026-02-28",
      purchaseType: "bundle",
      title: "Winter training",
    });
  });

  test.each(["past_due", "unpaid", "canceled", "incomplete"])(
    "%s without purchases does not grant access",
    (status) => {
      expect(
        describeAdminUser(user, [{ ...subscription, status }], [], [])
          .accessSource,
      ).toBe("none");
    },
  );

  test("uses webhook access windows and keeps a canceling member active", () => {
    const window: Doc<"membershipAccessWindows"> = {
      _creationTime: 1,
      _id: "window-1" as Doc<"membershipAccessWindows">["_id"],
      accessStart: "2025-09-01",
      referenceId: user._id,
      stripeSubscriptionId: "sub_1",
    };
    const result = describeAdminUser(
      user,
      [{ ...subscription, cancelAtPeriodEnd: true }],
      [purchase],
      [window],
    );
    expect(result.accessSource).toBe("subscription");
    expect(result.subscription?.accessStart).toBe("2025-09-01");
    expect(result.subscription?.cancelAtPeriodEnd).toBe(true);
    expect(result.purchasedBlockCount).toBe(1);
  });

  test("ignores another product even with a later billing period", () => {
    const unrelated = {
      ...subscription,
      periodEnd: Date.UTC(2027, 1, 1),
      plan: "other-product",
    };
    expect(
      describeAdminUser(user, [unrelated], [], []).subscription,
    ).toBeNull();
    expect(describeAdminUser(user, [unrelated], [], []).accessSource).toBe(
      "none",
    );
    expect(
      describeAdminUser(user, [unrelated, subscription], [], []).subscription
        ?.plan,
    ).toBe("inside-the-lab");
  });

  test("admin bypass is independent of purchases and coaches do not bypass billing", () => {
    const result = describeAdminUser(
      { ...user, role: "admin" },
      [],
      [purchase],
      [],
      user._id,
    );
    expect(result.accessSource).toBe("admin");
    expect(result.isCurrentUser).toBe(true);
    expect(result.purchases).toHaveLength(1);
    expect(
      describeAdminUser({ ...user, role: "coach" }, [], [], []).accessSource,
    ).toBe("none");
  });
});

test("includes users and their subscriptions beyond the former list limits", async () => {
  const users = Array.from({ length: 251 }, (_, index) => ({
    ...user,
    _id: `user-${index}` as AuthDoc<"user">["_id"],
  }));
  const subscriptions = Array.from({ length: 501 }, (_, index) => ({
    ...subscription,
    _id: `subscription-${index}` as AuthDoc<"subscription">["_id"],
    referenceId: index === 500 ? "user-250" : "unrelated-user",
  }));
  const ctx = {
    db: { query: () => ({ collect: async () => [] }) },
    runQuery: async (
      _query: unknown,
      args: {
        model: string;
        paginationOpts: { cursor: string | null; numItems: number };
      },
    ) => {
      const records = args.model === "user" ? users : subscriptions;
      const start = Number(args.paginationOpts.cursor ?? 0);
      const end = start + args.paginationOpts.numItems;
      return {
        continueCursor: String(end),
        isDone: end >= records.length,
        page: records.slice(start, end),
      };
    },
  } as unknown as QueryCtx;
  const result = await getAdminUsers(ctx);
  expect(result).toHaveLength(251);
  expect(result.find((record) => record.id === "user-250")?.accessSource).toBe(
    "subscription",
  );
  expect(result.find((record) => record.id === "user-0")?.accessSource).toBe(
    "none",
  );
});
