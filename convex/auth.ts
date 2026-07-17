import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { type BetterAuthOptions, betterAuth } from "better-auth/minimal";
import { ConvexError, v } from "convex/values";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import {
  internalQuery,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import authConfig from "./auth.config";
import authSchema from "./betterAuth/schema";
import {
  createPreviewUser,
  isPreviewAuthEnabled,
  type PreviewRole,
} from "./previewAuth";

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: { schema: authSchema },
    verbose: false,
  },
);

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    appName: "Threshold Lab",
    baseURL: process.env.SITE_URL,
    database: authComponent.adapter(ctx),
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const invite = await ctx.runQuery(
              internal.auth.isClientAllowedForSignup,
              { email: user.email.trim().toLowerCase() },
            );

            if (!invite) {
              throw new Error("You are not authorized to sign up.");
            }

            return {
              data: {
                ...user,
                role: invite.role,
              },
            };
          },
        },
      },
    },
    emailAndPassword: {
      enabled: true,
    },
    plugins: [convex({ authConfig })],
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    user: {
      additionalFields: {
        role: {
          defaultValue: "client",
          input: false,
          required: false,
          type: "string",
        },
      },
    },
  }) satisfies BetterAuthOptions;

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth(createAuthOptions(ctx));

const assertAdmin = async (ctx: QueryCtx | MutationCtx) => {
  if (isPreviewAuthEnabled()) {
    return;
  }

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
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
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
  args: {
    previewRole: v.optional(v.union(v.literal("admin"), v.literal("client"))),
  },
  handler: async (ctx, { previewRole }) => {
    if (isPreviewAuthEnabled()) {
      return createPreviewUser(previewRole as PreviewRole | undefined);
    }

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
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: normalizedEmail,
        isActive: isActive ?? existing.isActive,
        name: cleanedName,
        role: role ?? existing.role ?? "client",
      });
      return existing._id;
    }

    return await ctx.db.insert("clients", {
      email: normalizedEmail,
      isActive: isActive ?? true,
      name: cleanedName,
      role: role ?? "client",
    });
  },
});
