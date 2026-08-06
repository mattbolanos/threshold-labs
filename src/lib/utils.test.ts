import { describe, expect, test } from "bun:test";
import { formatWeekRangeLabel } from "./utils";

describe("formatWeekRangeLabel", () => {
  test("always formats week labels in English", () => {
    const weekStart = new Date(2026, 7, 3);

    expect(formatWeekRangeLabel(weekStart, true)).toBe("Aug 3 - Aug 9, 2026");
    expect(formatWeekRangeLabel(weekStart)).toBe("Aug 2026");
  });

  test("formats cross-month ranges in English", () => {
    const weekStart = new Date(2026, 7, 31);

    expect(formatWeekRangeLabel(weekStart, true)).toBe("Aug 31 - Sep 6, 2026");
  });
});
