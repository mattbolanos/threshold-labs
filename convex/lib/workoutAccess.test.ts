import { describe, expect, test } from "bun:test";
import {
  getAccessibleWorkoutDateRange,
  getAccessibleWorkoutDateRanges,
  getChartWorkoutDateRange,
  getWorkoutAccessWindow,
  getWorkoutListingAccessWindows,
  hasUnrestrictedWorkoutAccess,
  isWorkoutDateInAccessWindow,
  isWorkoutDateInAccessWindows,
  TRAINING_ARCHIVE_ACCESS_WINDOW,
} from "./workoutAccess";

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

  test("combines monthly and archive entitlements for dual owners", () => {
    expect(getWorkoutListingAccessWindows("subscription", true, now)).toEqual([
      { from: "2026-12-16", to: "2027-01-15" },
      TRAINING_ARCHIVE_ACCESS_WINDOW,
    ]);
  });

  test("keeps single-product and administrator access distinct", () => {
    expect(getWorkoutListingAccessWindows("subscription", false, now)).toEqual([
      { from: "2026-12-16", to: "2027-01-15" },
    ]);
    expect(
      getWorkoutListingAccessWindows("training_archive", true, now),
    ).toEqual([TRAINING_ARCHIVE_ACCESS_WINDOW]);
    expect(getWorkoutListingAccessWindows("admin", true, now)).toBeNull();
  });
});

describe("getAccessibleWorkoutDateRanges", () => {
  test("returns every purchased portion of a requested range", () => {
    expect(
      getAccessibleWorkoutDateRanges("2025-01-01", "2027-02-01", [
        { from: "2026-12-16", to: "2027-01-15" },
        TRAINING_ARCHIVE_ACCESS_WINDOW,
      ]),
    ).toEqual([
      { from: "2026-12-16", to: "2027-01-15" },
      TRAINING_ARCHIVE_ACCESS_WINDOW,
    ]);
  });
});

describe("getChartWorkoutDateRange", () => {
  const defaults = { from: "2026-05-01" };

  test("preserves the existing chart range for subscribers", () => {
    expect(
      getChartWorkoutDateRange(
        "subscription",
        "2025-01-01",
        undefined,
        defaults,
      ),
    ).toEqual({ from: "2025-01-01", to: undefined });
  });

  test("defaults archive charts to the purchased dataset", () => {
    expect(
      getChartWorkoutDateRange(
        "training_archive",
        undefined,
        undefined,
        defaults,
      ),
    ).toEqual(TRAINING_ARCHIVE_ACCESS_WINDOW);
  });

  test("clamps custom archive chart ranges", () => {
    expect(
      getChartWorkoutDateRange(
        "training_archive",
        "2025-01-01",
        "2027-01-01",
        defaults,
      ),
    ).toEqual(TRAINING_ARCHIVE_ACCESS_WINDOW);
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
      TRAINING_ARCHIVE_ACCESS_WINDOW,
    ];

    expect(isWorkoutDateInAccessWindows("2025-10-01", windows)).toBe(true);
    expect(isWorkoutDateInAccessWindows("2027-01-01", windows)).toBe(true);
    expect(isWorkoutDateInAccessWindows("2026-11-01", windows)).toBe(false);
    expect(isWorkoutDateInAccessWindows("1900-01-01", null)).toBe(true);
  });
});
