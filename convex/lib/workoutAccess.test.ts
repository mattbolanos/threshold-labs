import { describe, expect, test } from "bun:test";
import {
  getAccessibleWorkoutDateRange,
  getAccessibleWorkoutDateRanges,
  getChartWorkoutDateRanges,
  getMembershipAccessEnd,
  getMembershipAccessStart,
  getWorkoutAccessWindow,
  getWorkoutListingAccessWindows,
  hasUnrestrictedWorkoutAccess,
  isWorkoutDateInAccessWindow,
  isWorkoutDateInAccessWindows,
  mergeWorkoutAccessWindows,
} from "./workoutAccess";

const trainingArchive = { from: "2025-09-01", to: "2026-09-03" };

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

  test("combines monthly and history entitlements for dual owners", () => {
    expect(
      getWorkoutListingAccessWindows(
        {
          accessSource: "subscription",
          membershipAccessStart: "2026-07-05",
          trainingArchive,
        },
        now,
      ),
    ).toEqual([{ from: "2026-07-05", to: "2027-01-15" }, trainingArchive]);
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
        accessSource: "training_archive",
        trainingArchive,
      }),
    ).toEqual([trainingArchive]);
    expect(
      getWorkoutListingAccessWindows({
        accessSource: "admin",
        trainingArchive,
      }),
    ).toBeNull();
  });
});

describe("getAccessibleWorkoutDateRanges", () => {
  test("returns every purchased portion of a requested range", () => {
    expect(
      getAccessibleWorkoutDateRanges("2025-01-01", "2027-02-01", [
        { from: "2026-07-05", to: "2027-01-15" },
        trainingArchive,
      ]),
    ).toEqual([{ from: "2026-07-05", to: "2027-01-15" }, trainingArchive]);
  });
});

describe("getChartWorkoutDateRanges", () => {
  const defaults = { from: "2026-05-01" };

  test("clamps subscriber charts to the fixed membership boundary", () => {
    expect(
      getChartWorkoutDateRanges(
        {
          accessSource: "subscription",
          membershipAccessStart: "2026-07-05",
        },
        "2025-01-01",
        undefined,
        defaults,
        new Date("2026-09-03T16:00:00.000Z"),
      ),
    ).toEqual([{ from: "2026-07-05", to: "2026-09-03" }]);
  });

  test("defaults history charts to the purchased dataset", () => {
    expect(
      getChartWorkoutDateRanges(
        { accessSource: "training_archive", trainingArchive },
        undefined,
        undefined,
        { from: trainingArchive.from },
        new Date("2026-09-03T16:00:00.000Z"),
      ),
    ).toEqual([trainingArchive]);
  });

  test("clamps custom history chart ranges", () => {
    expect(
      getChartWorkoutDateRanges(
        { accessSource: "training_archive", trainingArchive },
        "2025-01-01",
        "2027-01-01",
        defaults,
      ),
    ).toEqual([trainingArchive]);
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
    const windows = [{ from: "2026-12-16", to: "2027-01-15" }, trainingArchive];

    expect(isWorkoutDateInAccessWindows("2025-10-01", windows)).toBe(true);
    expect(isWorkoutDateInAccessWindows("2027-01-01", windows)).toBe(true);
    expect(isWorkoutDateInAccessWindows("2026-11-01", windows)).toBe(false);
    expect(isWorkoutDateInAccessWindows("1900-01-01", null)).toBe(true);
  });
});
