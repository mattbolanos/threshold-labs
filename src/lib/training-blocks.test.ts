import { describe, expect, test } from "bun:test";
import type { Doc } from "../../convex/_generated/dataModel";
import { withTrainingBlockChartContext } from "./training-blocks";

const block = {
  _creationTime: 0,
  _id: "training-block" as Doc<"trainingBlocks">["_id"],
  createdAt: 0,
  description: "Build aerobic durability",
  endDate: "2026-06-21",
  startDate: "2026-06-01",
  title: "Base",
  updatedAt: 0,
};

describe("withTrainingBlockChartContext", () => {
  test("assigns inclusive block context and leaves outside dates empty", () => {
    const result = withTrainingBlockChartContext(
      [
        { date: "2026-05-31", value: 1 },
        { date: "2026-06-01", value: 2 },
        { date: "2026-06-21", value: 3 },
        { date: "2026-06-22", value: 4 },
      ],
      [block],
    );

    expect(result.map((point) => point.trainingBlock?.title ?? null)).toEqual([
      null,
      "Base",
      "Base",
      null,
    ]);
    expect(result[1].trainingBlockColor).toBe("chart-2");
  });
});
