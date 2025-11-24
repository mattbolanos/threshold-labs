import { and, gte, lte, max, min, sql } from "drizzle-orm";
import { z } from "zod";
import { DEFAULT_RUN_MIX_RANGE } from "@/app/constants";
import { workouts } from "@/lib/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const internalRouter = createTRPCRouter({
  getRollingLoad: protectedProcedure
    .input(
      z.object({
        from: z.string().optional(),
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
        whereConditions.push(
          gte(workouts.workoutDate, DEFAULT_RUN_MIX_RANGE.from),
        );
      }

      return await ctx.db
        .select({
          stl: sql<number>`sum(${workouts.subjectiveTrainingLoad})`,
          trueTrainingHours: sql<number>`sum(${workouts.trainingMinutes}) / 60`,
          week: workouts.week,
        })
        .from(workouts)
        .where(and(...whereConditions))
        .groupBy(workouts.week)
        .orderBy(workouts.week);
    }),

  getRunVolumeMix: protectedProcedure
    .input(
      z.object({
        from: z.string().optional(),
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
        whereConditions.push(
          gte(workouts.workoutDate, DEFAULT_RUN_MIX_RANGE.from),
        );
      }

      return await ctx.db
        .select({
          aerobicMiles: sql<number>`
            coalesce(sum(${workouts.totalRunMiles}), 0) - coalesce(sum(${workouts.speedMiles}), 0) - 
            coalesce(sum(${workouts.tempoMiles}), 0) - coalesce(sum(${workouts.thresholdMiles}), 0) - coalesce(sum(${workouts.vo2Miles}), 0)`,
          speedMiles: sql<number>`sum(${workouts.speedMiles})`,
          tempoMiles: sql<number>`sum(${workouts.tempoMiles})`,
          thresholdMiles: sql<number>`sum(${workouts.thresholdMiles})`,
          totalMiles: sql<number>`sum(${workouts.totalRunMiles})`,
          vo2Miles: sql<number>`sum(${workouts.vo2Miles})`,
          week: workouts.week,
        })
        .from(workouts)
        .where(and(...whereConditions))
        .groupBy(workouts.week)
        .orderBy(workouts.week);
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
