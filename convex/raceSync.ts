import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const raceInputValidator = v.object({
  country: v.string(),
  endDate: v.string(),
  externalKey: v.string(),
  locality: v.string(),
  name: v.string(),
  officialUrl: v.optional(v.string()),
  source: v.literal("hyrox-lab"),
  sourceUrl: v.string(),
  startDate: v.string(),
  syncedAt: v.number(),
  venueName: v.string(),
});

export const upsertRaceCatalog = internalMutation({
  args: { races: v.array(raceInputValidator) },
  handler: async (ctx, { races }) => {
    let added = 0;
    let updated = 0;

    for (const race of races) {
      const existing = await ctx.db
        .query("hyroxRaces")
        .withIndex("by_external_key", (q) =>
          q.eq("externalKey", race.externalKey),
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, race);
        updated += 1;
      } else {
        await ctx.db.insert("hyroxRaces", race);
        added += 1;
      }
    }

    return { added, updated };
  },
});
