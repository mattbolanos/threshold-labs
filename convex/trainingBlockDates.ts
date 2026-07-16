import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

type TrainingBlockRange = Pick<Doc<"trainingBlocks">, "endDate" | "startDate">;

export const findTrainingBlockForDate = <T extends TrainingBlockRange>(
  blocks: readonly T[],
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

export const getTrainingBlocksOverlappingRange = async (
  ctx: QueryCtx,
  from: string,
  to: string,
) => {
  const blocks = await ctx.db
    .query("trainingBlocks")
    .withIndex("by_start_date", (query) => query.lte("startDate", to))
    .order("asc")
    .collect();

  return blocks.filter(({ endDate }) => endDate >= from);
};
