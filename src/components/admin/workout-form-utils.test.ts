import { describe, expect, test } from "bun:test";
import {
  EMPTY_WORKOUT_FORM,
  validateWorkoutForm,
  type WorkoutFormState,
} from "./workout-form-utils";

const VALID_FORM: WorkoutFormState = {
  ...EMPTY_WORKOUT_FORM,
  rpe: "7",
  tags: ["Run"],
  title: "Long Run",
  trainingMinutes: "75",
  week: "2026-07-13",
  workoutDate: "2026-07-15",
  workoutPlan: "Steady aerobic run",
};

describe("workout form validation", () => {
  test("parses carbs when provided", () => {
    const result = validateWorkoutForm({ ...VALID_FORM, carbs: "60" });

    expect(result.errors).toEqual([]);
    expect(result.workout?.carbs).toBe(60);
  });

  test("rejects non-numeric carbs", () => {
    const result = validateWorkoutForm({ ...VALID_FORM, carbs: "sixty" });

    expect(result.workout).toBeNull();
    expect(result.errors).toContain("Carbs (g): Must be a valid number.");
  });
});
