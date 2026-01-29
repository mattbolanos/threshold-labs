import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(
  "postgresql://neondb_owner:npg_zGtXfiv2noI4@ep-holy-resonance-ah66nccm-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require",
);
export const db = drizzle({ client: sql });
