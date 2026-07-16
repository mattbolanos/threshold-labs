import { describe, expect, test } from "bun:test";
import { generateRaces } from "./generate_preview_races_import";
import { generateTrainingBlocks } from "./generate_preview_training_blocks_import";

const REFERENCE_DATE = "2026-07-16";

const getUtcDay = (date: string) =>
  new Date(`${date}T12:00:00.000Z`).getUTCDay();

describe("preview race seed", () => {
  test("includes realistic past and upcoming weekend races", () => {
    const races = generateRaces(REFERENCE_DATE);

    expect(
      races.filter(({ endDate }) => endDate < REFERENCE_DATE),
    ).toHaveLength(4);
    expect(
      races.filter(({ endDate }) => endDate >= REFERENCE_DATE),
    ).toHaveLength(6);

    for (const race of races) {
      expect(getUtcDay(race.startDate)).toBe(6);
      expect([0, 6]).toContain(getUtcDay(race.endDate));
      expect(race.createdAt).toBeLessThanOrEqual(race.updatedAt);
    }
  });
});

describe("preview training block seed", () => {
  test("includes contiguous complete, current, and upcoming blocks", () => {
    const blocks = generateTrainingBlocks(REFERENCE_DATE);
    const complete = blocks.filter(({ endDate }) => endDate < REFERENCE_DATE);
    const upcoming = blocks.filter(
      ({ startDate }) => startDate > REFERENCE_DATE,
    );
    const current = blocks.filter(
      ({ endDate, startDate }) =>
        startDate <= REFERENCE_DATE && endDate >= REFERENCE_DATE,
    );

    expect(complete).toHaveLength(4);
    expect(current).toHaveLength(1);
    expect(upcoming).toHaveLength(3);

    for (const [index, block] of blocks.entries()) {
      expect(getUtcDay(block.startDate)).toBe(1);
      expect(getUtcDay(block.endDate)).toBe(0);
      expect(block.createdAt).toBeLessThanOrEqual(block.updatedAt);

      if (index > 0) {
        const previousEnd = new Date(
          `${blocks[index - 1].endDate}T12:00:00.000Z`,
        );
        previousEnd.setUTCDate(previousEnd.getUTCDate() + 1);
        expect(block.startDate).toBe(previousEnd.toISOString().slice(0, 10));
      }
    }
  });
});
