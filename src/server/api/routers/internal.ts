import { and, gte, lte, max, min, sql, sum } from "drizzle-orm";
import { z } from "zod";
import { workouts } from "@/lib/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const internalRouter = createTRPCRouter({
  getRunVolumeMix: protectedProcedure
    .input(
      z.object({
        from: z.string(),
        to: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const whereConditions = [];

      if (input.from && input.to) {
        whereConditions.push(
          and(
            gte(workouts.workoutDate, input.from),
            lte(workouts.workoutDate, input.to),
          ),
        );
      } else {
        whereConditions.push(gte(workouts.workoutDate, input.from));
      }

      return await ctx.db
        .select({
          cycle: workouts.cycle,
          easyMiles: sql<number>`coalesce(sum(${workouts.totalRunMiles}), 0) - coalesce(sum(${workouts.speedMiles}), 0) - coalesce(sum(${workouts.tempoMiles}), 0) - coalesce(sum(${workouts.thresholdMiles}), 0) - coalesce(sum(${workouts.vo2Miles}), 0)`,
          speedMiles: sum(workouts.speedMiles),
          tempoMiles: sum(workouts.tempoMiles),
          thresholdMiles: sum(workouts.thresholdMiles),
          totalMiles: sum(workouts.totalRunMiles),
          vo2Miles: sum(workouts.vo2Miles),
        })
        .from(workouts)
        .where(and(...whereConditions))
        .groupBy(workouts.cycle)
        .orderBy(workouts.cycle);
    }),

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

  getWorkoutsDateRange: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({
        maxWorkoutDate: max(workouts.workoutDate),
        minWorkoutDate: min(workouts.workoutDate),
      })
      .from(workouts)
      .limit(1)
      .then((rows) => rows[0]);
  }),
});
