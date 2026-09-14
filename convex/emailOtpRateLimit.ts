import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const OTP_REQUEST_COOLDOWN_MS = 30 * 1000;

const clearEmailOtpRequestRef = makeFunctionReference<
  "mutation",
  { email: string; requestedAt: number },
  null
>("emailOtpRateLimit:clearEmailOtpRequest");

export const clearEmailOtpRequest = internalMutation({
  args: {
    email: v.string(),
    requestedAt: v.number(),
  },
  handler: async (ctx, { email, requestedAt }) => {
    const request = await ctx.db
      .query("emailOtpRequests")
      .withIndex("by_email", (queryBuilder) => queryBuilder.eq("email", email))
      .first();

    if (request?.requestedAt === requestedAt) {
      await ctx.db.delete(request._id);
    }
  },
});

export const claimEmailOtpRequest = internalMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const existing = await ctx.db
      .query("emailOtpRequests")
      .withIndex("by_email", (queryBuilder) => queryBuilder.eq("email", email))
      .first();
    const requestedAt = Date.now();

    if (
      existing &&
      requestedAt - existing.requestedAt < OTP_REQUEST_COOLDOWN_MS
    ) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil(
            (OTP_REQUEST_COOLDOWN_MS - (requestedAt - existing.requestedAt)) /
              1000,
          ),
        ),
      };
    }

    if (existing) {
      await ctx.db.patch(existing._id, { requestedAt });
      await ctx.scheduler.runAfter(
        OTP_REQUEST_COOLDOWN_MS,
        clearEmailOtpRequestRef,
        { email, requestedAt },
      );
      return { allowed: true, retryAfterSeconds: 0 };
    }

    await ctx.db.insert("emailOtpRequests", { email, requestedAt });
    await ctx.scheduler.runAfter(
      OTP_REQUEST_COOLDOWN_MS,
      clearEmailOtpRequestRef,
      { email, requestedAt },
    );
    return { allowed: true, retryAfterSeconds: 0 };
  },
});
