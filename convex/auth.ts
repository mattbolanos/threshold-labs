import { ConvexError, v } from "convex/values";
import {
  internalQuery,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { authComponent } from "./betterAuth/auth";

const assertAdmin = async (ctx: QueryCtx | MutationCtx) => {
  const user = await authComponent.safeGetAuthUser(ctx);

  if (!user || user.role !== "admin") {
    throw new ConvexError("Only admins can manage client invites.");
  }
};

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

    if (!client?.isActive) {
      return null;
    }

    return {
      role: client.role,
    };
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
    role: v.optional(
      v.union(v.literal("admin"), v.literal("client"), v.literal("coach")),
    ),
  },
  handler: async (ctx, { email, isActive, name, role }) => {
    await assertAdmin(ctx);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name?.trim();
    const cleanedName =
      normalizedName && normalizedName.length > 0 ? normalizedName : undefined;

    const existing = await ctx.db
      .query("clients")
      .withIndex("by_email_lower", (q) => q.eq("emailLower", normalizedEmail))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: email.trim(),
        isActive: isActive ?? existing.isActive,
        name: cleanedName,
        role: role ?? existing.role ?? "client",
      });
      return existing._id;
    }

    return await ctx.db.insert("clients", {
      email: email.trim(),
      emailLower: normalizedEmail,
      isActive: isActive ?? true,
      name: cleanedName,
      role: role ?? "client",
    });
  },
});
