import { ConvexError, v } from "convex/values";
import {
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { authComponent } from "./auth";
import { isPreviewAuthEnabled } from "./previewAuth";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const HYROX_DIVISIONS = new Set([
  "Pro Singles",
  "Pro Doubles",
  "Mixed Doubles",
  "Elite 15 Singles",
  "Elite 15 Doubles",
]);

const raceInputValidator = v.object({
  division: v.optional(v.union(v.string(), v.null())),
  endDate: v.string(),
  eventType: v.union(v.literal("hyrox"), v.literal("run"), v.literal("other")),
  location: v.optional(v.union(v.string(), v.null())),
  name: v.string(),
  startDate: v.string(),
});

type RaceInput = {
  division?: string | null;
  endDate: string;
  eventType: "hyrox" | "run" | "other";
  location?: string | null;
  name: string;
  startDate: string;
};

const assertAdmin = async (ctx: QueryCtx | MutationCtx) => {
  if (isPreviewAuthEnabled()) return;

  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user || user.role !== "admin") {
    throw new ConvexError("Only admins can manage races.");
  }
};

const toOptionalString = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeRace = (race: RaceInput) => {
  const name = race.name.trim();
  const startDate = race.startDate.trim();
  const endDate = race.endDate.trim();
  const location = toOptionalString(race.location);
  const division = toOptionalString(race.division);

  if (!name) throw new ConvexError("Race name is required.");
  if (!DATE_PATTERN.test(startDate) || !DATE_PATTERN.test(endDate)) {
    throw new ConvexError("Choose valid race dates.");
  }
  if (endDate < startDate) {
    throw new ConvexError("The end date cannot be before the start date.");
  }
  if (race.eventType === "hyrox" && !division) {
    throw new ConvexError("Choose a HYROX division.");
  }
  if (
    division &&
    race.eventType === "hyrox" &&
    !HYROX_DIVISIONS.has(division)
  ) {
    throw new ConvexError("Choose a supported HYROX division.");
  }

  return {
    ...(division && race.eventType === "hyrox" ? { division } : {}),
    endDate,
    eventType: race.eventType,
    ...(location ? { location } : {}),
    name,
    startDate,
  };
};

export const createRace = mutation({
  args: { race: raceInputValidator },
  handler: async (ctx, { race }) => {
    await assertAdmin(ctx);
    const now = Date.now();
    return await ctx.db.insert("races", {
      ...normalizeRace(race),
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateRace = mutation({
  args: { race: raceInputValidator, raceId: v.id("races") },
  handler: async (ctx, { race, raceId }) => {
    await assertAdmin(ctx);
    const existing = await ctx.db.get(raceId);
    if (!existing) throw new ConvexError("Race not found.");

    await ctx.db.replace(raceId, {
      ...normalizeRace(race),
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    });
    return raceId;
  },
});

export const deleteRace = mutation({
  args: { raceId: v.id("races") },
  handler: async (ctx, { raceId }) => {
    await assertAdmin(ctx);
    if (!(await ctx.db.get(raceId))) throw new ConvexError("Race not found.");
    await ctx.db.delete(raceId);
    return raceId;
  },
});

export const getRacesForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);
    return await ctx.db
      .query("races")
      .withIndex("by_start_date")
      .order("asc")
      .collect();
  },
});

export const getUpcomingRaces = query({
  args: { fromDate: v.string() },
  handler: async (ctx, { fromDate }) => {
    if (!DATE_PATTERN.test(fromDate)) return [];
    const races = await ctx.db
      .query("races")
      .withIndex("by_start_date")
      .collect();
    return races.filter(({ endDate }) => endDate >= fromDate);
  },
});
