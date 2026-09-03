import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { type BetterAuthOptions, betterAuth } from "better-auth/minimal";
import { emailOTP } from "better-auth/plugins";
import { ConvexError, v } from "convex/values";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import {
  type ActionCtx,
  internalQuery,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import authConfig from "./auth.config";
import authSchema from "./betterAuth/schema";
import { getAuthEnvironment } from "./lib/authEnvironment";
import { EMAIL_OTP_EXPIRES_IN_SECONDS } from "./lib/emailOtp";
import {
  hasActiveLabSubscription,
  INSIDE_LAB_PLAN_NAME,
} from "./lib/labAccess";
import { createStripeAuthPlugin } from "./lib/stripeAuth";
import {
  createPreviewUser,
  isPreviewAuthEnabled,
  type PreviewRole,
} from "./previewAuth";

const userRoleValidator = v.union(
  v.literal("admin"),
  v.literal("client"),
  v.literal("coach"),
);

type UserRole = "admin" | "client" | "coach";

type AuthUserRecord = {
  createdAt: Date | number;
  email: string;
  emailVerified: boolean;
  id: string;
  name: string;
  role?: string | null;
  stripeCustomerId?: string | null;
  updatedAt: Date | number;
};

type AuthSubscriptionRecord = {
  cancelAt?: Date | number | null;
  cancelAtPeriodEnd?: boolean | null;
  periodEnd?: Date | number | null;
  plan: string;
  referenceId: string;
  status?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
};

const normalizeRole = (role?: string | null): UserRole => {
  if (role === "admin" || role === "coach") {
    return role;
  }

  return "client";
};

const toTimestamp = (value?: Date | number | null) => {
  if (value instanceof Date) {
    return value.getTime();
  }

  return typeof value === "number" ? value : null;
};

const getBootstrapAdminEmail = () =>
  process.env.AUTH_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase() || null;

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
            const normalizedEmail = user.email.trim().toLowerCase();
            const invite = await ctx.runQuery(internal.auth.getSignupRole, {
              email: normalizedEmail,
            });
            const bootstrapAdminEmail = getBootstrapAdminEmail();

            return {
              data: {
                ...user,
                role:
                  normalizedEmail === bootstrapAdminEmail
                    ? "admin"
                    : (invite?.role ?? "client"),
              },
            };
          },
        },
      },
    },
    emailAndPassword: {
      enabled: false,
    },
    plugins: [
      convex({ authConfig }),
      emailOTP({
        allowedAttempts: 5,
        expiresIn: EMAIL_OTP_EXPIRES_IN_SECONDS,
        sendVerificationOTP: async ({ email, otp, type }) => {
          if (!("scheduler" in ctx)) {
            throw new Error(
              "Email OTP delivery must run in a Convex mutation or action.",
            );
          }

          await ctx.scheduler.runAfter(0, internal.emails.sendEmailOtp, {
            otp,
            recipient: email,
            type,
          });
        },
        storeOTP: "hashed",
      }),
      createStripeAuthPlugin(ctx),
    ],
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

export const assertAdmin = async (ctx: QueryCtx | MutationCtx | ActionCtx) => {
  if (isPreviewAuthEnabled()) {
    return null;
  }

  const user = await authComponent.safeGetAuthUser(ctx);

  if (!user || user.role !== "admin") {
    throw new ConvexError("Administrator access is required.");
  }

  return user;
};

export const getLabAccess = async (ctx: QueryCtx | MutationCtx) => {
  if (isPreviewAuthEnabled()) {
    return {
      hasAccess: true,
      hasBillingAccount: false,
      source: "preview" as const,
      subscription: null,
    };
  }

  const user = await authComponent.safeGetAuthUser(ctx);

  if (!user) {
    return {
      hasAccess: false,
      hasBillingAccount: false,
      source: "none" as const,
      subscription: null,
    };
  }

  if (user.role === "admin") {
    return {
      hasAccess: true,
      hasBillingAccount: Boolean(user.stripeCustomerId),
      source: "admin" as const,
      subscription: null,
    };
  }

  const adapter = authComponent.adapter(ctx)(createAuthOptions(ctx));
  const subscriptions = await adapter.findMany<AuthSubscriptionRecord>({
    model: "subscription",
    where: [{ field: "referenceId", value: user._id.toString() }],
  });
  const membershipSubscriptions = subscriptions.filter(
    (subscription) => subscription.plan === INSIDE_LAB_PLAN_NAME,
  );
  const activeSubscription = membershipSubscriptions.find((subscription) =>
    hasActiveLabSubscription([subscription]),
  );
  const latestSubscription = membershipSubscriptions.toSorted(
    (left, right) =>
      (toTimestamp(right.periodEnd) ?? 0) - (toTimestamp(left.periodEnd) ?? 0),
  )[0];
  const subscription = activeSubscription ?? latestSubscription;
  const hasBillingAccount = Boolean(
    user.stripeCustomerId ||
      subscriptions.some((subscription) => subscription.stripeCustomerId),
  );

  return {
    hasAccess: Boolean(activeSubscription),
    hasBillingAccount: activeSubscription ? true : hasBillingAccount,
    source: activeSubscription ? ("subscription" as const) : ("none" as const),
    subscription: subscription
      ? {
          cancelAt: toTimestamp(subscription.cancelAt),
          cancelAtPeriodEnd: Boolean(subscription.cancelAtPeriodEnd),
          periodEnd: toTimestamp(subscription.periodEnd),
          status: subscription.status ?? "unknown",
        }
      : null,
  };
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

export const getCurrentStripeSubscriptionReference = internalQuery({
  args: {},
  handler: async (ctx) => {
    if (isPreviewAuthEnabled()) {
      return null;
    }

    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return null;
    }

    const adapter = authComponent.adapter(ctx)(createAuthOptions(ctx));
    const subscriptions = await adapter.findMany<AuthSubscriptionRecord>({
      model: "subscription",
      where: [{ field: "referenceId", value: user._id.toString() }],
    });
    const membershipSubscriptions = subscriptions.filter(
      (subscription) => subscription.plan === INSIDE_LAB_PLAN_NAME,
    );
    const activeSubscription = membershipSubscriptions.find((subscription) =>
      hasActiveLabSubscription([subscription]),
    );
    const latestSubscription = membershipSubscriptions.toSorted(
      (left, right) =>
        (toTimestamp(right.periodEnd) ?? 0) -
        (toTimestamp(left.periodEnd) ?? 0),
    )[0];

    return (
      activeSubscription?.stripeSubscriptionId ??
      latestSubscription?.stripeSubscriptionId ??
      null
    );
  },
});

export const listAdminUsers = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await assertAdmin(ctx);

    if (isPreviewAuthEnabled()) {
      return [];
    }

    const adapter = authComponent.adapter(ctx)(createAuthOptions(ctx));
    const [users, subscriptions] = await Promise.all([
      adapter.findMany<AuthUserRecord>({
        limit: 250,
        model: "user",
        sortBy: { direction: "desc", field: "createdAt" },
      }),
      adapter.findMany<AuthSubscriptionRecord>({
        limit: 500,
        model: "subscription",
      }),
    ]);

    const subscriptionsByUser = new Map<string, AuthSubscriptionRecord[]>();
    for (const subscription of subscriptions) {
      const existing = subscriptionsByUser.get(subscription.referenceId) ?? [];
      existing.push(subscription);
      subscriptionsByUser.set(subscription.referenceId, existing);
    }

    return users.map((user) => {
      const userSubscriptions = subscriptionsByUser.get(user.id) ?? [];
      const activeSubscription = userSubscriptions.find((subscription) =>
        hasActiveLabSubscription([subscription]),
      );
      const latestSubscription = userSubscriptions.toSorted(
        (left, right) =>
          (toTimestamp(right.periodEnd) ?? 0) -
          (toTimestamp(left.periodEnd) ?? 0),
      )[0];
      const subscription = activeSubscription ?? latestSubscription;
      const role = normalizeRole(user.role);

      return {
        accessSource:
          role === "admin"
            ? ("admin" as const)
            : activeSubscription
              ? ("subscription" as const)
              : ("none" as const),
        createdAt: toTimestamp(user.createdAt) ?? 0,
        email: user.email,
        emailVerified: user.emailVerified,
        hasStripeCustomer: Boolean(user.stripeCustomerId),
        id: user.id,
        isCurrentUser: currentUser
          ? currentUser._id.toString() === user.id
          : false,
        name: user.name,
        role,
        subscription: subscription
          ? {
              cancelAtPeriodEnd: Boolean(subscription.cancelAtPeriodEnd),
              periodEnd: toTimestamp(subscription.periodEnd),
              plan: subscription.plan,
              status: subscription.status ?? "unknown",
            }
          : null,
      };
    });
  },
});

export const updateAdminUserRole = mutation({
  args: {
    role: userRoleValidator,
    userId: v.string(),
  },
  handler: async (ctx, { role, userId }) => {
    const currentUser = await assertAdmin(ctx);

    if (!currentUser) {
      throw new ConvexError("User roles cannot be changed in preview mode.");
    }

    if (currentUser._id.toString() === userId && role !== "admin") {
      throw new ConvexError("You cannot remove your own administrator role.");
    }

    const adapter = authComponent.adapter(ctx)(createAuthOptions(ctx));
    const targetUser = await adapter.findOne<AuthUserRecord>({
      model: "user",
      where: [{ field: "id", value: userId }],
    });

    if (!targetUser) {
      throw new ConvexError("User not found.");
    }

    if (targetUser.role === "admin" && role !== "admin") {
      const admins = await adapter.findMany<AuthUserRecord>({
        limit: 2,
        model: "user",
        where: [{ field: "role", value: "admin" }],
      });

      if (admins.length <= 1) {
        throw new ConvexError(
          "Promote another administrator before removing the last administrator.",
        );
      }
    }

    await adapter.update<AuthUserRecord>({
      model: "user",
      update: { role, updatedAt: new Date() },
      where: [{ field: "id", value: userId }],
    });

    const invite = await ctx.db
      .query("clients")
      .withIndex("by_email", (queryBuilder) =>
        queryBuilder.eq("email", targetUser.email.trim().toLowerCase()),
      )
      .first();

    if (invite) {
      await ctx.db.patch(invite._id, { role });
    }

    return { role, userId };
  },
});

export const upsertClientInvite = mutation({
  args: {
    email: v.string(),
    isActive: v.optional(v.boolean()),
    name: v.optional(v.string()),
    role: v.optional(userRoleValidator),
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
