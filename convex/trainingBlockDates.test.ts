import { describe, expect, test } from "bun:test";
import { findTrainingBlockForDate } from "./trainingBlockDates";

const blocks = [
  { endDate: "2026-06-21", startDate: "2026-06-01", title: "Base" },
  { endDate: "2026-07-12", startDate: "2026-06-22", title: "Build" },
];

describe("findTrainingBlockForDate", () => {
  test("matches both inclusive boundaries", () => {
    expect(findTrainingBlockForDate(blocks, "2026-06-01")?.title).toBe("Base");
    expect(findTrainingBlockForDate(blocks, "2026-06-21")?.title).toBe("Base");
  });

  test("returns null between defined ranges", () => {
    expect(findTrainingBlockForDate(blocks, "2026-05-31")).toBeNull();
  });

  test("prefers the block with the latest start date when ranges overlap", () => {
    const overlappingBlocks = [
      blocks[0],
      {
        endDate: "2026-06-18",
        startDate: "2026-06-10",
        title: "Race prep",
      },
    ];

    expect(
      findTrainingBlockForDate(overlappingBlocks, "2026-06-12")?.title,
    ).toBe("Race prep");
  });
});
