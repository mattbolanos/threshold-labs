import type { Config } from "drizzle-kit";

export default {
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  schemaFilter: ["thlab"],
} satisfies Config;
