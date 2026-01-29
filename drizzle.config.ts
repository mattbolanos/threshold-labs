import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/lib/db/schema.ts",
  schemaFilter: ["thlab"],
});
