import { describe, expect, test } from "bun:test";
import {
  getPurchasedBlockWindows,
  getTrainingBlockPurchaseDate,
  isCompletedTrainingBlock,
  isTrainingBlockForSale,
} from "./trainingBlockPurchases";

describe("isTrainingBlockForSale", () => {
  test("sells blocks once they have started", () => {
    const block = { endDate: "2026-09-02", startDate: "2026-07-20" };

    expect(isTrainingBlockForSale(block, "2026-09-03")).toBe(true);
    expect(isTrainingBlockForSale(block, "2026-08-01")).toBe(true);
    expect(isTrainingBlockForSale(block, "2026-07-20")).toBe(true);
    expect(isTrainingBlockForSale(block, "2026-07-19")).toBe(false);
  });
});

describe("isCompletedTrainingBlock", () => {
  test("only bundles blocks that ended before today", () => {
    const block = { endDate: "2026-09-02", startDate: "2026-07-20" };

    expect(isCompletedTrainingBlock(block, "2026-09-03")).toBe(true);
    expect(isCompletedTrainingBlock(block, "2026-09-02")).toBe(false);
    expect(isCompletedTrainingBlock(block, "2026-08-01")).toBe(false);
  });
});

describe("getTrainingBlockPurchaseDate", () => {
  test("uses the lab calendar date of the payment", () => {
    expect(
      getTrainingBlockPurchaseDate(Date.parse("2026-09-03T03:30:00.000Z")),
    ).toBe("2026-09-02");
  });
});

describe("getPurchasedBlockWindows", () => {
  test("keeps separate blocks as separate windows and merges overlaps", () => {
    expect(
      getPurchasedBlockWindows([
        { accessEnd: "2025-11-23", accessStart: "2025-10-13" },
        { accessEnd: "2025-10-12", accessStart: "2025-09-01" },
        { accessEnd: "2025-12-01", accessStart: "2025-11-20" },
      ]),
    ).toEqual([
      { from: "2025-09-01", to: "2025-10-12" },
      { from: "2025-10-13", to: "2025-12-01" },
    ]);
  });
});
