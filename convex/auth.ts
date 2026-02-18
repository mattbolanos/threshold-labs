import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";

export const isClientAllowedForSignup = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const client = await ctx.db
      .query("clients")
      .withIndex("by_email_lower", (q) => q.eq("emailLower", normalizedEmail))
      .first();

    return Boolean(client?.isActive);
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return (await authComponent.safeGetAuthUser(ctx)) ?? null;
  },
});

export const upsertClientInvite = mutation({
  args: {
    email: v.string(),
    isActive: v.optional(v.boolean()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { email, isActive, name }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await ctx.db
      .query("clients")
      .withIndex("by_email_lower", (q) => q.eq("emailLower", normalizedEmail))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: email.trim(),
        isActive: isActive ?? existing.isActive,
        name,
      });
      return existing._id;
    }

    return await ctx.db.insert("clients", {
      email: email.trim(),
      emailLower: normalizedEmail,
      isActive: isActive ?? true,
      name,
    });
  },
});
