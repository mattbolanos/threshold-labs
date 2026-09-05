import { describe, expect, test } from "bun:test";
import {
  getAccessibleWorkoutDateRange,
  getAccessibleWorkoutDateRanges,
  getChartWorkoutDateRange,
  getMembershipAccessEnd,
  getMembershipAccessStart,
  getTrainingCalendarRange,
  getWorkoutAccessWindow,
  getWorkoutListingAccessWindows,
  hasUnrestrictedWorkoutAccess,
  isWorkoutDateInAccessWindow,
  isWorkoutDateInAccessWindows,
  mergeWorkoutAccessWindows,
} from "./workoutAccess";

const purchasedBlockWindows = [
  { from: "2025-09-01", to: "2025-10-12" },
  { from: "2025-10-13", to: "2025-11-23" },
];

describe("getWorkoutAccessWindow", () => {
  test("includes today and the prior 30 calendar days in Eastern time", () => {
    expect(
      getWorkoutAccessWindow(new Date("2026-09-03T03:30:00.000Z")),
    ).toEqual({
      from: "2026-08-03",
      to: "2026-09-02",
    });
  });

  test("moves forward at midnight Eastern time", () => {
    expect(
      getWorkoutAccessWindow(new Date("2026-09-03T04:00:00.000Z")),
    ).toEqual({
      from: "2026-08-04",
      to: "2026-09-03",
    });
  });
});

describe("getMembershipAccessStart", () => {
  test("fixes the membership boundary one month before purchase", () => {
    expect(
      getMembershipAccessStart(Date.parse("2026-09-03T16:00:00.000Z")),
    ).toBe("2026-08-03");
  });

  test("clamps to the end of shorter months", () => {
    expect(
      getMembershipAccessStart(Date.parse("2026-03-31T16:00:00.000Z")),
    ).toBe("2026-02-28");
  });
});

describe("getMembershipAccessEnd", () => {
  test("closes the window on the paid-through date for scheduled cancellations", () => {
    expect(
      getMembershipAccessEnd(
        Date.parse("2026-11-03T16:00:00.000Z"),
        Date.parse("2026-11-03T15:59:00.000Z"),
      ),
    ).toBe("2026-11-03");
  });

  test("closes the window immediately when access lapses before the period ends", () => {
    expect(
      getMembershipAccessEnd(
        Date.parse("2026-10-20T16:00:00.000Z"),
        Date.parse("2026-11-03T16:00:00.000Z"),
      ),
    ).toBe("2026-10-20");
    expect(getMembershipAccessEnd(Date.parse("2026-10-20T16:00:00.000Z"))).toBe(
      "2026-10-20",
    );
  });
});

describe("mergeWorkoutAccessWindows", () => {
  test("keeps a lapse between memberships as a gap", () => {
    expect(
      mergeWorkoutAccessWindows([
        { from: "2026-08-03", to: "2026-11-03" },
        { from: "2027-01-15", to: "2027-03-01" },
      ]),
    ).toEqual([
      { from: "2026-08-03", to: "2026-11-03" },
      { from: "2027-01-15", to: "2027-03-01" },
    ]);
  });

  test("joins overlapping windows when a member returns within a month", () => {
    expect(
      mergeWorkoutAccessWindows([
        { from: "2026-12-01", to: "2027-01-10" },
        { from: "2026-08-03", to: "2026-11-03" },
        { from: "2026-10-20", to: "2026-12-05" },
      ]),
    ).toEqual([{ from: "2026-08-03", to: "2027-01-10" }]);
  });
});

describe("getAccessibleWorkoutDateRange", () => {
  const accessWindow = { from: "2026-08-03", to: "2026-09-02" };

  test("clamps a requested range to both inclusive boundaries", () => {
    expect(
      getAccessibleWorkoutDateRange("2026-01-01", "2026-12-31", accessWindow),
    ).toEqual(accessWindow);
  });

  test("keeps the full requested range when access is unrestricted", () => {
    expect(
      getAccessibleWorkoutDateRange("2020-01-01", "2030-01-01", null),
    ).toEqual({ from: "2020-01-01", to: "2030-01-01" });
  });

  test("returns null when the ranges do not overlap", () => {
    expect(
      getAccessibleWorkoutDateRange("2026-07-01", "2026-08-02", accessWindow),
    ).toBeNull();
    expect(
      getAccessibleWorkoutDateRange("2026-09-03", "2026-09-10", accessWindow),
    ).toBeNull();
  });

  test("rejects invalid requested dates", () => {
    expect(
      getAccessibleWorkoutDateRange("not-a-date", "2026-09-02", accessWindow),
    ).toBeNull();
    expect(
      getAccessibleWorkoutDateRange("2026-09-02", "2026-08-03", accessWindow),
    ).toBeNull();
  });
});

describe("hasUnrestrictedWorkoutAccess", () => {
  test("grants unrestricted access only to admins and preview mode", () => {
    expect(hasUnrestrictedWorkoutAccess("admin")).toBe(true);
    expect(hasUnrestrictedWorkoutAccess("preview")).toBe(true);
    expect(hasUnrestrictedWorkoutAccess("subscription")).toBe(false);
    expect(hasUnrestrictedWorkoutAccess("none")).toBe(false);
  });
});

describe("getWorkoutListingAccessWindows", () => {
  const now = new Date("2027-01-15T17:00:00.000Z");

  test("combines purchased blocks and the membership window for dual owners", () => {
    expect(
      getWorkoutListingAccessWindows(
        {
          accessSource: "subscription",
          membershipAccessStart: "2026-07-05",
          purchasedBlockWindows,
        },
        now,
      ),
    ).toEqual([
      ...purchasedBlockWindows,
      { from: "2026-07-05", to: "2027-01-15" },
    ]);
  });

  test("merges a purchased block that overlaps the membership window", () => {
    expect(
      getWorkoutListingAccessWindows(
        {
          accessSource: "subscription",
          membershipAccessStart: "2026-07-05",
          purchasedBlockWindows: [{ from: "2026-06-08", to: "2026-07-19" }],
        },
        now,
      ),
    ).toEqual([{ from: "2026-06-08", to: "2027-01-15" }]);
  });

  test("excludes the lapsed period between an ended and a renewed membership", () => {
    expect(
      getWorkoutListingAccessWindows(
        {
          accessSource: "subscription",
          membershipAccessStart: "2026-12-16",
          pastMembershipWindows: [{ from: "2026-05-03", to: "2026-08-03" }],
        },
        now,
      ),
    ).toEqual([
      { from: "2026-05-03", to: "2026-08-03" },
      { from: "2026-12-16", to: "2027-01-15" },
    ]);
  });

  test("keeps single-product and administrator access distinct", () => {
    expect(
      getWorkoutListingAccessWindows(
        {
          accessSource: "subscription",
          membershipAccessStart: "2026-07-05",
        },
        now,
      ),
    ).toEqual([{ from: "2026-07-05", to: "2027-01-15" }]);
    expect(
      getWorkoutListingAccessWindows({
        accessSource: "training_blocks",
        purchasedBlockWindows,
      }),
    ).toEqual(purchasedBlockWindows);
    expect(
      getWorkoutListingAccessWindows({
        accessSource: "admin",
        purchasedBlockWindows,
      }),
    ).toBeNull();
  });
});

describe("getAccessibleWorkoutDateRanges", () => {
  test("returns every purchased portion of a requested range", () => {
    expect(
      getAccessibleWorkoutDateRanges("2025-01-01", "2027-02-01", [
        ...purchasedBlockWindows,
        { from: "2026-07-05", to: "2027-01-15" },
      ]),
    ).toEqual([
      ...purchasedBlockWindows,
      { from: "2026-07-05", to: "2027-01-15" },
    ]);
  });
});

describe("getChartWorkoutDateRange", () => {
  const defaults = { from: "2026-05-01" };

  test("uses the requested range as-is without clamping to entitlements", () => {
    expect(
      getChartWorkoutDateRange(
        "2025-01-01",
        "2025-10-20",
        defaults,
        new Date("2026-09-03T16:00:00.000Z"),
      ),
    ).toEqual({ from: "2025-01-01", to: "2025-10-20" });
  });

  test("falls back to the default start and today in Eastern time", () => {
    expect(
      getChartWorkoutDateRange(
        undefined,
        undefined,
        defaults,
        new Date("2026-09-03T16:00:00.000Z"),
      ),
    ).toEqual({ from: "2026-05-01", to: "2026-09-03" });
  });

  test("prefers an explicit default end date over today", () => {
    expect(
      getChartWorkoutDateRange(
        undefined,
        undefined,
        { from: "2026-05-01", to: "2026-06-01" },
        new Date("2026-09-03T16:00:00.000Z"),
      ),
    ).toEqual({ from: "2026-05-01", to: "2026-06-01" });
  });

  test("rejects an inverted or malformed range", () => {
    expect(
      getChartWorkoutDateRange("2026-06-01", "2026-05-01", defaults),
    ).toBeNull();
    expect(getChartWorkoutDateRange("nope", undefined, defaults)).toBeNull();
  });
});

describe("isWorkoutDateInAccessWindow", () => {
  const accessWindow = { from: "2026-08-03", to: "2026-09-02" };

  test("includes both endpoints but excludes older and future workouts", () => {
    expect(isWorkoutDateInAccessWindow("2026-08-03", accessWindow)).toBe(true);
    expect(isWorkoutDateInAccessWindow("2026-09-02", accessWindow)).toBe(true);
    expect(isWorkoutDateInAccessWindow("2026-08-02", accessWindow)).toBe(false);
    expect(isWorkoutDateInAccessWindow("2026-09-03", accessWindow)).toBe(false);
  });
});

describe("isWorkoutDateInAccessWindows", () => {
  test("accepts a workout covered by either purchased product", () => {
    const windows = [
      { from: "2026-12-16", to: "2027-01-15" },
      ...purchasedBlockWindows,
    ];

    expect(isWorkoutDateInAccessWindows("2025-10-01", windows)).toBe(true);
    expect(isWorkoutDateInAccessWindows("2027-01-01", windows)).toBe(true);
    expect(isWorkoutDateInAccessWindows("2026-11-01", windows)).toBe(false);
    expect(isWorkoutDateInAccessWindows("1900-01-01", null)).toBe(true);
  });
});

describe("getTrainingCalendarRange", () => {
  const now = new Date("2026-09-04T16:00:00.000Z");

  test("bounds restricted viewers to their merged access windows", () => {
    expect(
      getTrainingCalendarRange(
        [{ from: "2026-07-20", to: "2026-08-16" }],
        null,
        now,
      ),
    ).toEqual({ from: "2026-07-20", to: "2026-08-16" });
  });

  test("spans from the earliest to the latest window when there are several", () => {
    expect(
      getTrainingCalendarRange(
        [
          { from: "2025-09-01", to: "2025-10-12" },
          { from: "2026-08-05", to: "2026-09-04" },
        ],
        null,
        now,
      ),
    ).toEqual({ from: "2025-09-01", to: "2026-09-04" });
  });

  test("falls back to today when a restricted viewer has no windows", () => {
    expect(getTrainingCalendarRange([], null, now)).toEqual({
      from: null,
      to: "2026-09-04",
    });
  });

  test("lets unrestricted viewers reach every published workout and today", () => {
    expect(
      getTrainingCalendarRange(
        null,
        { from: "2025-09-01", to: "2026-08-30" },
        now,
      ),
    ).toEqual({ from: "2025-09-01", to: "2026-09-04" });
    expect(
      getTrainingCalendarRange(
        null,
        { from: "2025-09-01", to: "2026-09-20" },
        now,
      ),
    ).toEqual({ from: "2025-09-01", to: "2026-09-20" });
  });

  test("has no lower bound for unrestricted viewers without workouts", () => {
    expect(getTrainingCalendarRange(null, null, now)).toEqual({
      from: null,
      to: "2026-09-04",
    });
  });
});
