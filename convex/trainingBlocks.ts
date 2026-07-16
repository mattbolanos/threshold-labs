import { ConvexError, v } from "convex/values";
import {
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { authComponent } from "./auth";
import { isPreviewAuthEnabled } from "./previewAuth";
import {
  findTrainingBlockForDate,
  getTrainingBlocksOverlappingRange,
} from "./trainingBlockDates";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const trainingBlockInputValidator = v.object({
  description: v.string(),
  endDate: v.string(),
  startDate: v.string(),
  title: v.string(),
});

type TrainingBlockInput = {
  description: string;
  endDate: string;
  startDate: string;
  title: string;
};

const assertAdmin = async (ctx: QueryCtx | MutationCtx) => {
  if (isPreviewAuthEnabled()) return;

  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user || user.role !== "admin") {
    throw new ConvexError("Only admins can manage training blocks.");
  }
};

const normalizeTrainingBlock = (block: TrainingBlockInput) => {
  const title = block.title.trim();
  const description = block.description.trim();
  const startDate = block.startDate.trim();
  const endDate = block.endDate.trim();

  if (!title) throw new ConvexError("Block title is required.");
  if (!description) throw new ConvexError("Block description is required.");
  if (!DATE_PATTERN.test(startDate) || !DATE_PATTERN.test(endDate)) {
    throw new ConvexError("Choose valid training block dates.");
  }
  if (endDate < startDate) {
    throw new ConvexError("The end date cannot be before the start date.");
  }

  return { description, endDate, startDate, title };
};

export const createTrainingBlock = mutation({
  args: { block: trainingBlockInputValidator },
  handler: async (ctx, { block }) => {
    await assertAdmin(ctx);
    const now = Date.now();
    return await ctx.db.insert("trainingBlocks", {
      ...normalizeTrainingBlock(block),
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTrainingBlock = mutation({
  args: {
    block: trainingBlockInputValidator,
    blockId: v.id("trainingBlocks"),
  },
  handler: async (ctx, { block, blockId }) => {
    await assertAdmin(ctx);
    const existing = await ctx.db.get(blockId);
    if (!existing) throw new ConvexError("Training block not found.");

    await ctx.db.replace(blockId, {
      ...normalizeTrainingBlock(block),
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    });
    return blockId;
  },
});

export const deleteTrainingBlock = mutation({
  args: { blockId: v.id("trainingBlocks") },
  handler: async (ctx, { blockId }) => {
    await assertAdmin(ctx);
    if (!(await ctx.db.get(blockId))) {
      throw new ConvexError("Training block not found.");
    }
    await ctx.db.delete(blockId);
    return blockId;
  },
});

export const getTrainingBlocksForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);
    return await ctx.db
      .query("trainingBlocks")
      .withIndex("by_start_date")
      .order("desc")
      .collect();
  },
});

export const getCurrentTrainingBlock = query({
  args: { onDate: v.string() },
  handler: async (ctx, { onDate }) => {
    if (!DATE_PATTERN.test(onDate)) return null;

    const blocks = await getTrainingBlocksOverlappingRange(ctx, onDate, onDate);

    return findTrainingBlockForDate(blocks, onDate);
  },
});
