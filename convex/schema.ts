import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  clients: defineTable({
    email: v.string(),
    isActive: v.boolean(),
    name: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("client"), v.literal("coach")),
  }).index("by_email", ["email"]),

  hyroxRaces: defineTable({
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
  })
    .index("by_external_key", ["externalKey"])
    .index("by_start_date", ["startDate"]),

  plannedHyroxRaces: defineTable({
    plannedAt: v.number(),
    raceId: v.id("hyroxRaces"),
  }).index("by_race_id", ["raceId"]),

  posts: defineTable({
    category: v.string(),
    content: v.string(),
    createdAt: v.number(),
    excerpt: v.string(),
    isVisible: v.boolean(),
    publishedAt: v.number(),
    slug: v.string(),
    title: v.string(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published_at", ["publishedAt"])
    .index("by_visibility_and_published_at", ["isVisible", "publishedAt"]),

  workouts: defineTable({
    burpees: v.optional(v.number()),
    carbs: v.optional(v.number()),
    cardioMinutes: v.optional(v.number()),
    isHidden: v.optional(v.boolean()),
    lt1Miles: v.optional(v.number()),
    lt2Miles: v.optional(v.number()),
    notes: v.optional(v.string()),
    rpe: v.number(),
    speedMiles: v.optional(v.number()),
    tags: v.array(v.string()),
    title: v.string(),
    totalBikeMiles: v.optional(v.number()),
    totalRowKs: v.optional(v.number()),
    totalRunMiles: v.optional(v.number()),
    totalSkiKs: v.optional(v.number()),
    trainingMinutes: v.number(),
    vo2Miles: v.optional(v.number()),
    wallballs: v.optional(v.number()),
    week: v.string(),
    workoutDate: v.string(),
    workoutPlan: v.string(),
  }).index("by_workout_date", ["workoutDate"]),
});
