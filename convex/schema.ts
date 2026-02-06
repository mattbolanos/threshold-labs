import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  clients: defineTable({
    email: v.string(),
    emailLower: v.string(),
    isActive: v.boolean(),
    name: v.optional(v.string()),
  }).index("by_email_lower", ["emailLower"]),
  workouts: defineTable({
    burpees: v.optional(v.number()),
    cardioMinutes: v.optional(v.number()),
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
