import type { Doc } from "../../convex/_generated/dataModel";

export const TRAINING_BLOCK_CHART_COLORS = [
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const;

export type TrainingBlockChartColor =
  (typeof TRAINING_BLOCK_CHART_COLORS)[number];

export type WorkoutWithTrainingBlock = Doc<"workouts"> & {
  trainingBlock: Doc<"trainingBlocks"> | null;
};

export type TrainingBlockChartContext = {
  trainingBlock: Doc<"trainingBlocks"> | null;
  trainingBlockColor: TrainingBlockChartColor | null;
};

const findTrainingBlockForDate = (
  blocks: readonly Doc<"trainingBlocks">[],
  date: string,
) => {
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    const block = blocks[index];
    if (block.startDate <= date && block.endDate >= date) {
      return block;
    }
  }

  return null;
};

export const withTrainingBlockChartContext = <T extends { date: string }>(
  data: readonly T[],
  blocks: readonly Doc<"trainingBlocks">[],
): Array<T & TrainingBlockChartContext> => {
  const blockColors = new Map(
    blocks.map((block, index) => [
      block._id,
      TRAINING_BLOCK_CHART_COLORS[index % TRAINING_BLOCK_CHART_COLORS.length],
    ]),
  );

  return data.map((point) => {
    const trainingBlock = findTrainingBlockForDate(blocks, point.date);
    return {
      ...point,
      trainingBlock,
      trainingBlockColor: trainingBlock
        ? (blockColors.get(trainingBlock._id) ?? null)
        : null,
    };
  });
};
