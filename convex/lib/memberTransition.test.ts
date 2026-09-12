import { describe, expect, test } from "bun:test";
import {
  getComplimentaryAccessThrough,
  getTransitionAccessEnd,
  isDiscountOfferAvailable,
  validateTransitionDate,
} from "./memberTransition";
import { getWorkoutListingAccessWindows } from "./workoutAccess";

const availableAt = Date.parse("2026-10-05T13:00:00Z");
const offer = {
  availableAt,
  discountType: "fifty_monthly" as const,
  recipientEmail: "member@example.com",
  status: "active" as const,
};

describe("existing-member transition", () => {
  test("grants free access before the invitation and throughout its Eastern calendar day", () => {
    expect(
      getComplimentaryAccessThrough(
        [offer],
        Date.parse("2026-09-12T12:00:00Z"),
      ),
    ).toBe("2026-10-05");
    expect(
      getComplimentaryAccessThrough(
        [offer],
        Date.parse("2026-10-06T03:59:59Z"),
      ),
    ).toBe("2026-10-05");
    expect(
      getComplimentaryAccessThrough(
        [offer],
        Date.parse("2026-10-06T04:00:00Z"),
      ),
    ).toBeNull();
  });

  test("does not accept payment before the invitation time", () => {
    expect(isDiscountOfferAvailable(offer, availableAt - 1)).toBe(false);
    expect(isDiscountOfferAvailable(offer, availableAt)).toBe(true);
    expect(isDiscountOfferAvailable({ status: "active" }, availableAt)).toBe(
      true,
    );
  });

  test("revoked, failed, redeemed, and expired grants do not allow free access", () => {
    for (const status of [
      "revoked",
      "failed",
      "redeemed",
      "provisioning",
    ] as const) {
      expect(
        getComplimentaryAccessThrough([{ ...offer, status }], availableAt),
      ).toBeNull();
      expect(isDiscountOfferAvailable({ ...offer, status }, availableAt)).toBe(
        false,
      );
    }
    expect(
      getComplimentaryAccessThrough(
        [{ ...offer, complimentaryAccessExpired: true }],
        availableAt,
      ),
    ).toBeNull();
    expect(
      getComplimentaryAccessThrough(
        [{ ...offer, availableAt: undefined }],
        availableAt,
      ),
    ).toBeNull();
    expect(
      getComplimentaryAccessThrough(
        [{ ...offer, recipientEmail: undefined }],
        availableAt,
      ),
    ).toBeNull();
  });

  test("includes all training history and published workouts, without future workouts", () => {
    expect(
      getWorkoutListingAccessWindows(
        { accessSource: "transition" },
        new Date("2026-09-12T12:00:00Z"),
      ),
    ).toEqual([{ from: "2025-09-01", to: "2026-09-12" }]);
    expect(getWorkoutListingAccessWindows({ accessSource: "none" })).toEqual(
      [],
    );
  });

  test("expires at Eastern midnight in summer, winter, and across daylight-saving changes", () => {
    expect(getTransitionAccessEnd(availableAt)).toBe(
      Date.parse("2026-10-06T04:00:00Z"),
    );
    expect(getTransitionAccessEnd(Date.parse("2026-12-05T14:00:00Z"))).toBe(
      Date.parse("2026-12-06T05:00:00Z"),
    );
    expect(getTransitionAccessEnd(Date.parse("2026-11-01T14:00:00Z"))).toBe(
      Date.parse("2026-11-02T05:00:00Z"),
    );
    expect(getTransitionAccessEnd(Date.parse("2026-03-08T13:00:00Z"))).toBe(
      Date.parse("2026-03-09T04:00:00Z"),
    );
  });

  test("only schedules recipient-bound $50 offers for a future date", () => {
    expect(() => validateTransitionDate(offer, availableAt - 1)).not.toThrow();
    for (const input of [
      { ...offer, availableAt: Number.NaN },
      { ...offer, availableAt: availableAt - 2 },
      { ...offer, recipientEmail: undefined },
      { ...offer, discountType: "free_forever" },
    ]) {
      expect(() => validateTransitionDate(input, availableAt - 1)).toThrow();
    }
  });
});
