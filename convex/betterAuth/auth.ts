import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { components, internal } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";

export const authComponent = createClient<DataModel, typeof schema>(
  (components as unknown as { betterAuth: unknown }).betterAuth as never,
  {
    local: { schema },
    verbose: false,
  },
);

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  const authApi = internal as unknown as {
    auth: { isClientAllowedForSignup: unknown };
  };
  const runAuthQuery = ctx.runQuery as unknown as (
    fn: unknown,
    args: { email: string },
  ) => Promise<boolean>;

  return {
    appName: "Threshold Lab",
    baseURL: process.env.SITE_URL,
    database: authComponent.adapter(ctx),
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const isAllowed = await runAuthQuery(
              authApi.auth.isClientAllowedForSignup,
              { email: user.email.trim().toLowerCase() },
            );

            if (!isAllowed) {
              throw new Error("You are not authorized to sign up.");
            }

            return { data: user };
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
          type: ["admin", "client", "coach"],
        },
      },
    },
  } satisfies BetterAuthOptions;
};

export const options = createAuthOptions({} as GenericCtx<DataModel>);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};
