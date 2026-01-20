import { v } from "convex/values";
import { addWeeks, format, startOfWeek } from "date-fns";
import { query } from "./_generated/server";

const getDefaultFromDate = () =>
  format(
    addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), -18),
    "yyyy-MM-dd",
  );

export const getRollingLoad = query({
  args: {
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  },
  handler: async (ctx, { from, to }) => {
    const fromDate = from ?? getDefaultFromDate();

    let workoutsQuery = ctx.db
      .query("workouts")
      .filter((q) => q.gte(q.field("workoutDate"), fromDate));

    if (to) {
      workoutsQuery = ctx.db
        .query("workouts")
        .filter((q) =>
          q.and(
            q.gte(q.field("workoutDate"), fromDate),
            q.lte(q.field("workoutDate"), to),
          ),
        );
    }

    const workouts = await workoutsQuery.collect();

    // Group by week and calculate aggregations
    const weeklyData = new Map<
      string,
      { stl: number; trueTrainingHours: number }
    >();

    for (const workout of workouts) {
      const existing = weeklyData.get(workout.week) ?? {
        stl: 0,
        trueTrainingHours: 0,
      };

      const runMultiplier = (workout.totalRunMiles ?? 0) > 0 ? 1.1 : 1;
      const stl = workout.rpe * (workout.trainingMinutes / 10) * runMultiplier;
      const trainingHours = workout.trainingMinutes / 60;

      weeklyData.set(workout.week, {
        stl: existing.stl + stl,
        trueTrainingHours: existing.trueTrainingHours + trainingHours,
      });
    }

    return Array.from(weeklyData.entries())
      .map(([week, data]) => ({
        stl: data.stl,
        trueTrainingHours: data.trueTrainingHours,
        week,
      }))
      .sort((a, b) => a.week.localeCompare(b.week));
  },
});

export const getRunVolumeMix = query({
  args: {
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  },
  handler: async (ctx, { from, to }) => {
    const fromDate = from ?? getDefaultFromDate();

    let workoutsQuery = ctx.db
      .query("workouts")
      .filter((q) => q.gte(q.field("workoutDate"), fromDate));

    if (to) {
      workoutsQuery = ctx.db
        .query("workouts")
        .filter((q) =>
          q.and(
            q.gte(q.field("workoutDate"), fromDate),
            q.lte(q.field("workoutDate"), to),
          ),
        );
    }

    const workouts = await workoutsQuery.collect();

    // Group by week and calculate aggregations
    const weeklyData = new Map<
      string,
      {
        totalMiles: number;
        speedMiles: number;
        lt1Miles: number;
        lt2Miles: number;
        vo2Miles: number;
      }
    >();

    for (const workout of workouts) {
      const existing = weeklyData.get(workout.week) ?? {
        lt1Miles: 0,
        lt2Miles: 0,
        speedMiles: 0,
        totalMiles: 0,
        vo2Miles: 0,
      };

      weeklyData.set(workout.week, {
        lt1Miles: existing.lt1Miles + (workout.lt1Miles ?? 0),
        lt2Miles: existing.lt2Miles + (workout.lt2Miles ?? 0),
        speedMiles: existing.speedMiles + (workout.speedMiles ?? 0),
        totalMiles: existing.totalMiles + (workout.totalRunMiles ?? 0),
        vo2Miles: existing.vo2Miles + (workout.vo2Miles ?? 0),
      });
    }

    return Array.from(weeklyData.entries())
      .map(([week, data]) => ({
        aerobicMiles:
          data.totalMiles -
          data.speedMiles -
          data.lt1Miles -
          data.lt2Miles -
          data.vo2Miles,
        lt1Miles: data.lt1Miles,
        lt2Miles: data.lt2Miles,
        speedMiles: data.speedMiles,
        totalMiles: data.totalMiles,
        vo2Miles: data.vo2Miles,
        week,
      }))
      .sort((a, b) => a.week.localeCompare(b.week));
  },
});

export const getWorkouts = query({
  args: {
    from: v.string(),
    to: v.string(),
  },
  handler: async (ctx, { from, to }) => {
    return await ctx.db
      .query("workouts")
      .filter((q) =>
        q.and(
          q.gte(q.field("workoutDate"), from),
          q.lte(q.field("workoutDate"), to),
        ),
      )
      .collect();
  },
});

export const getWorkoutsDateRange = query({
  handler: async (ctx) => {
    const maxWorkoutDate = await ctx.db
      .query("workouts")
      .withIndex("by_workout_date")
      .order("desc")
      .first();
    const minWorkoutDate = await ctx.db
      .query("workouts")
      .withIndex("by_workout_date")
      .order("asc")
      .first();

    return {
      maxWorkoutDate,
      minWorkoutDate,
    };
  },
});
