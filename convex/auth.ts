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
import { getAuthEnvironment } from "./lib/authEnvironment";
import { createStripeAuthPlugin } from "./lib/stripeAuth";
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
    baseURL: getAuthEnvironment(ctx, "SITE_URL"),
    database: authComponent.adapter(ctx),
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const invite = await ctx.runQuery(internal.auth.getSignupRole, {
              email: user.email.trim().toLowerCase(),
            });

            return {
              data: {
                ...user,
                role: invite?.role ?? "client",
              },
            };
          },
        },
      },
    },
    emailAndPassword: {
      enabled: true,
    },
    plugins: [convex({ authConfig }), createStripeAuthPlugin(ctx)],
    secret: getAuthEnvironment(ctx, "BETTER_AUTH_SECRET"),
    socialProviders: {
      google: {
        clientId: getAuthEnvironment(ctx, "GOOGLE_CLIENT_ID"),
        clientSecret: getAuthEnvironment(ctx, "GOOGLE_CLIENT_SECRET"),
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

export const getLabAccess = async (ctx: QueryCtx | MutationCtx) => {
  if (isPreviewAuthEnabled()) {
    return { hasAccess: true, source: "preview" as const };
  }

  const user = await authComponent.safeGetAuthUser(ctx);

  if (!user) {
    return { hasAccess: false, source: "none" as const };
  }

  if (user.role === "admin") {
    return { hasAccess: true, source: "admin" as const };
  }

  const adapter = authComponent.adapter(ctx)(createAuthOptions(ctx));
  const subscriptions = await adapter.findMany<{
    status?: string | null;
    stripeSubscriptionId?: string | null;
  }>({
    model: "subscription",
    where: [{ field: "referenceId", value: user._id.toString() }],
  });
  const hasActiveSubscription = subscriptions.some(
    ({ status, stripeSubscriptionId }) =>
      Boolean(stripeSubscriptionId) &&
      (status === "active" || status === "trialing"),
  );

  return hasActiveSubscription
    ? { hasAccess: true, source: "subscription" as const }
    : { hasAccess: false, source: "none" as const };
};

export const assertLabAccess = async (ctx: QueryCtx | MutationCtx) => {
  const access = await getLabAccess(ctx);

  if (!access.hasAccess) {
    throw new ConvexError("An active membership is required.");
  }
};

export const getSignupRole = internalQuery({
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

export const getCurrentLabAccess = query({
  args: {},
  handler: getLabAccess,
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
