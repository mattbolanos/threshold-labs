import { and, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { workouts } from "@/lib/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const internalRouter = createTRPCRouter({
  getWorkouts: protectedProcedure
    .input(
      z.object({
        from: z.string(),
        to: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.workouts.findMany({
        where: and(
          gte(workouts.workoutDate, input.from),
          lte(workouts.workoutDate, input.to),
        ),
      });
    }),
});
