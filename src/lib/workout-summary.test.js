import { describe, expect, test } from "bun:test";
import { formatOneDecimal } from "./utils";
import { getWeekSummary } from "./workout-summary";

describe("weekly workout summaries", () => {
  test("uses explicit cardio minutes for mixed workouts", () => {
    const summary = getWeekSummary([
      {
        cardioMinutes: 30,
        rpe: 5,
        totalRunMiles: 3,
        trainingMinutes: 60,
      },
      {
        rpe: 4,
        trainingMinutes: 45,
      },
    ]);

    expect(summary.trainingHours).toBe(1.75);
    expect(summary.cardioHours).toBe(0.5);
  });

  test("formats half-tenths consistently", () => {
    expect(formatOneDecimal(897 / 60)).toBe("15.0");
  });
});
