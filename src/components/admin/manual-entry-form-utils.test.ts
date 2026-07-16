import { describe, expect, test } from "bun:test";
import { createEmptyRaceForm, validateRaceForm } from "./race-form-utils";
import {
  createEmptyTrainingBlockForm,
  validateTrainingBlockForm,
} from "./training-block-form-utils";

describe("manual race form", () => {
  test("requires a division for HYROX races", () => {
    const result = validateRaceForm({
      ...createEmptyRaceForm(),
      division: "",
      endDate: "2026-09-19",
      name: "HYROX DC",
      startDate: "2026-09-18",
    });

    expect(result.race).toBeNull();
    expect(result.errors.division).toBe("Choose a HYROX division.");
  });

  test("clears division data for run races", () => {
    const result = validateRaceForm({
      ...createEmptyRaceForm(),
      division: "Pro Singles",
      endDate: "2026-10-04",
      eventType: "run",
      location: "Brooklyn, NY",
      name: "Harbor 10K",
      startDate: "2026-10-04",
    });

    expect(result.errors).toEqual({});
    expect(result.race?.division).toBeNull();
    expect(result.race?.eventType).toBe("run");
  });
});

describe("training block form", () => {
  test("rejects a reversed date range", () => {
    const result = validateTrainingBlockForm({
      ...createEmptyTrainingBlockForm(),
      description: "Build durable threshold volume.",
      endDate: "2026-07-01",
      startDate: "2026-08-01",
      title: "Threshold durability",
    });

    expect(result.block).toBeNull();
    expect(result.errors.endDate).toBe(
      "End date must be on or after the start date.",
    );
  });
});
