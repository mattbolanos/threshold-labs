import { ConvexError, v } from "convex/values";
import { internalQuery, mutation } from "./_generated/server";
import { authComponent } from "./auth";

export const isPreviewAdminEnabled = () => process.env.VERCEL_ENV === "preview";

export const getSession = internalQuery({
  args: {},
  handler: async (ctx): Promise<boolean> => {
    if (!isPreviewAdminEnabled()) return false;

    const identity = await ctx.auth.getUserIdentity();
    if (typeof identity?.sessionId !== "string") return false;

    const sessionId = identity.sessionId;
    const session = await ctx.db
      .query("previewAdminSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", sessionId))
      .unique();

    return session?.userId === identity.subject;
  },
});

export const setEnabled = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, { enabled }) => {
    if (!isPreviewAdminEnabled()) {
      throw new ConvexError(
        "Admin impersonation is only available in Vercel previews.",
      );
    }

    const user = await authComponent.safeGetAuthUser(ctx);
    const identity = await ctx.auth.getUserIdentity();
    if (!user || typeof identity?.sessionId !== "string") {
      throw new ConvexError("Please sign in to impersonate an admin.");
    }

    const sessionId = identity.sessionId;
    const session = await ctx.db
      .query("previewAdminSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", sessionId))
      .unique();

    if (enabled && !session) {
      await ctx.db.insert("previewAdminSessions", {
        sessionId,
        userId: user._id.toString(),
      });
    } else if (!enabled && session) {
      await ctx.db.delete(session._id);
    }
  },
});
