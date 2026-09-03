import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  clients: defineTable({
    email: v.string(),
    isActive: v.boolean(),
    name: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("client"), v.literal("coach")),
  }).index("by_email", ["email"]),

  discountCodes: defineTable({
    code: v.string(),
    createdAt: v.number(),
    createdByUserId: v.string(),
    deliveredAt: v.optional(v.number()),
    deliveryError: v.optional(v.string()),
    deliveryStatus: v.optional(
      v.union(
        v.literal("not_requested"),
        v.literal("pending"),
        v.literal("sent"),
        v.literal("failed"),
      ),
    ),
    discountType: v.union(
      v.literal("fifty_monthly"),
      v.literal("free_forever"),
    ),
    failureReason: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
    redeemedAt: v.optional(v.number()),
    redeemedByEmail: v.optional(v.string()),
    revokedAt: v.optional(v.number()),
    status: v.union(
      v.literal("provisioning"),
      v.literal("active"),
      v.literal("redeemed"),
      v.literal("revoked"),
      v.literal("failed"),
    ),
    stripeCouponId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    stripePromotionCodeId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_stripe_promotion_code", ["stripePromotionCodeId"]),

  emailOtpRequests: defineTable({
    email: v.string(),
    requestedAt: v.number(),
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

  membershipAccessWindows: defineTable({
    accessEnd: v.optional(v.string()),
    accessStart: v.string(),
    referenceId: v.string(),
    stripeSubscriptionId: v.string(),
  })
    .index("by_reference_id", ["referenceId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"]),

  plannedHyroxRaces: defineTable({
    plannedAt: v.number(),
    raceId: v.id("hyroxRaces"),
  }).index("by_race_id", ["raceId"]),

  posts: defineTable({
    category: v.string(),
    content: v.string(),
    createdAt: v.number(),
    excerpt: v.string(),
    isPinned: v.optional(v.boolean()),
    isVisible: v.boolean(),
    publishedAt: v.number(),
    slug: v.string(),
    title: v.string(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published_at", ["publishedAt"])
    .index("by_visibility_and_published_at", ["isVisible", "publishedAt"]),

  races: defineTable({
    createdAt: v.number(),
    division: v.optional(v.string()),
    endDate: v.string(),
    eventType: v.union(
      v.literal("hyrox"),
      v.literal("run"),
      v.literal("other"),
    ),
    location: v.optional(v.string()),
    name: v.string(),
    startDate: v.string(),
    updatedAt: v.number(),
  }).index("by_start_date", ["startDate"]),

  trainingArchivePurchases: defineTable({
    accessEnd: v.string(),
    accessStart: v.string(),
    purchasedAt: v.number(),
    referenceId: v.string(),
    status: v.literal("active"),
    stripeCheckoutSessionId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
  })
    .index("by_reference_id", ["referenceId"])
    .index("by_stripe_checkout_session", ["stripeCheckoutSessionId"]),

  trainingBlocks: defineTable({
    createdAt: v.number(),
    description: v.string(),
    endDate: v.string(),
    startDate: v.string(),
    title: v.string(),
    updatedAt: v.number(),
  }).index("by_start_date", ["startDate"]),

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
