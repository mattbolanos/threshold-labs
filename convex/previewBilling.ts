import { ConvexError, v } from "convex/values";
import { internalMutation } from "./_generated/server";

/** Repair references left by the old preview seed replacement behavior. */
export const repairTrainingBlockReferences = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, { dryRun = true }) => {
    if (process.env.VERCEL_ENV !== "preview") {
      throw new ConvexError("Billing fixture repairs are limited to previews.");
    }

    const [blocks, purchases] = await Promise.all([
      ctx.db.query("trainingBlocks").collect(),
      ctx.db.query("trainingBlockPurchases").collect(),
    ]);
    const currentIds = new Set(blocks.map((block) => block._id));
    const repairs = purchases
      .filter((purchase) => !currentIds.has(purchase.trainingBlockId))
      .map((purchase) => {
        const matches = blocks.filter(
          (block) =>
            block.title === purchase.trainingBlockTitle &&
            block.startDate === purchase.accessStart &&
            block.endDate === purchase.accessEnd,
        );
        if (matches.length !== 1) {
          throw new ConvexError(
            "A missing purchased block has no unique title/date match. No repairs applied.",
          );
        }
        return { purchaseId: purchase._id, trainingBlockId: matches[0]._id };
      });

    if (!dryRun) {
      for (const repair of repairs) {
        await ctx.db.patch(repair.purchaseId, {
          trainingBlockId: repair.trainingBlockId,
        });
      }
    }

    return {
      dryRun,
      matched: repairs.length,
      unchanged: purchases.length - repairs.length,
    };
  },
});
