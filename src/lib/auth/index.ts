import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";

export const auth = betterAuth({
  appName: "Threshold Lab",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const isAllowed = await db
            .select({ id: clients.id })
            .from(clients)
            .where(
              and(
                sql`lower(${clients.email}) = lower(${user.email.trim()})`,
                eq(clients.isActive, true),
              ),
            );

          if (isAllowed.length === 0) {
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
});

export const checkAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return session;
};
