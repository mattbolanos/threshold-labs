import { describe, expect, test } from "bun:test";
import { resolveMembershipAccess } from "./membershipAccess";

const endedSubscription = {
  _creationTime: Date.parse("2026-06-03T16:00:00.000Z"),
  _id: "sub_db_1",
  endedAt: Date.parse("2026-08-03T16:00:00.000Z"),
  periodEnd: Date.parse("2026-08-03T16:00:00.000Z"),
  stripeSubscriptionId: "sub_1",
};
const activeSubscription = {
  _creationTime: Date.parse("2027-01-16T16:00:00.000Z"),
  _id: "sub_db_2",
  periodEnd: Date.parse("2027-02-16T16:00:00.000Z"),
  stripeSubscriptionId: "sub_2",
};

describe("resolveMembershipAccess", () => {
  test("uses the stored windows and keeps the lapse between subscriptions", () => {
    expect(
      resolveMembershipAccess({
        activeSubscriptionId: activeSubscription._id,
        subscriptions: [endedSubscription, activeSubscription],
        windows: [
          {
            accessEnd: "2026-08-03",
            accessStart: "2026-05-03",
            stripeSubscriptionId: "sub_1",
          },
          { accessStart: "2026-12-16", stripeSubscriptionId: "sub_2" },
        ],
      }),
    ).toEqual({
      accessStart: "2026-12-16",
      pastAccessWindows: [{ from: "2026-05-03", to: "2026-08-03" }],
    });
  });

  test("derives windows from Better Auth records that predate the table", () => {
    expect(
      resolveMembershipAccess({
        activeSubscriptionId: activeSubscription._id,
        subscriptions: [endedSubscription, activeSubscription],
        windows: [],
      }),
    ).toEqual({
      accessStart: "2026-12-16",
      pastAccessWindows: [{ from: "2026-05-03", to: "2026-08-03" }],
    });
  });

  test("returns nothing without an active subscription", () => {
    expect(
      resolveMembershipAccess({
        activeSubscriptionId: null,
        subscriptions: [endedSubscription],
        windows: [],
      }),
    ).toEqual({ accessStart: null, pastAccessWindows: [] });
  });

  test("skips records that never became a Stripe subscription", () => {
    expect(
      resolveMembershipAccess({
        activeSubscriptionId: activeSubscription._id,
        subscriptions: [
          { ...endedSubscription, stripeSubscriptionId: null },
          activeSubscription,
        ],
        windows: [],
      }).pastAccessWindows,
    ).toEqual([]);
  });
});
