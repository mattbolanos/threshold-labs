import { ConvexError, v } from "convex/values";
import { addWeeks, format, startOfWeek } from "date-fns";
import {
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { authComponent } from "./betterAuth/auth";

const getDefaultFromDate = () =>
  format(
    addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), -18),
    "yyyy-MM-dd",
  );

const workoutInputValidator = v.object({
  burpees: v.optional(v.union(v.number(), v.null())),
  cardioMinutes: v.optional(v.union(v.number(), v.null())),
  isHidden: v.optional(v.boolean()),
  lt1Miles: v.optional(v.union(v.number(), v.null())),
  lt2Miles: v.optional(v.union(v.number(), v.null())),
  notes: v.optional(v.union(v.string(), v.null())),
  rpe: v.number(),
  speedMiles: v.optional(v.union(v.number(), v.null())),
  tags: v.array(v.string()),
  title: v.string(),
  totalBikeMiles: v.optional(v.union(v.number(), v.null())),
  totalRowKs: v.optional(v.union(v.number(), v.null())),
  totalRunMiles: v.optional(v.union(v.number(), v.null())),
  totalSkiKs: v.optional(v.union(v.number(), v.null())),
  trainingMinutes: v.number(),
  vo2Miles: v.optional(v.union(v.number(), v.null())),
  wallballs: v.optional(v.union(v.number(), v.null())),
  week: v.string(),
  workoutDate: v.string(),
  workoutPlan: v.string(),
});

const toOptionalNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  return value;
};

const toOptionalString = (value: string | null | undefined) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
};

const compactObject = <T extends Record<string, unknown>>(value: T) => {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
};

const normalizeWorkout = (workout: {
  burpees?: number | null;
  cardioMinutes?: number | null;
  isHidden?: boolean;
  lt1Miles?: number | null;
  lt2Miles?: number | null;
  notes?: string | null;
  rpe: number;
  speedMiles?: number | null;
  tags: string[];
  title: string;
  totalBikeMiles?: number | null;
  totalRowKs?: number | null;
  totalRunMiles?: number | null;
  totalSkiKs?: number | null;
  trainingMinutes: number;
  vo2Miles?: number | null;
  wallballs?: number | null;
  week: string;
  workoutDate: string;
  workoutPlan: string;
}) => {
  const title = workout.title.trim();
  const week = workout.week.trim();
  const workoutDate = workout.workoutDate.trim();
  const workoutPlan = workout.workoutPlan.trim();
  const cleanedTags = workout.tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  if (!title) {
    throw new ConvexError("Title is required.");
  }
  if (!week) {
    throw new ConvexError("Week is required.");
  }
  if (!workoutDate) {
    throw new ConvexError("Workout date is required.");
  }
  if (cleanedTags.length === 0) {
    throw new ConvexError("At least one tag is required.");
  }
  if (
    !Number.isFinite(workout.trainingMinutes) ||
    workout.trainingMinutes < 0
  ) {
    throw new ConvexError("Training minutes must be a valid number.");
  }
  if (!Number.isFinite(workout.rpe) || workout.rpe < 0) {
    throw new ConvexError("RPE must be a valid number.");
  }

  return compactObject({
    burpees: toOptionalNumber(workout.burpees),
    cardioMinutes: toOptionalNumber(workout.cardioMinutes),
    isHidden: workout.isHidden ?? false,
    lt1Miles: toOptionalNumber(workout.lt1Miles),
    lt2Miles: toOptionalNumber(workout.lt2Miles),
    notes: toOptionalString(workout.notes),
    rpe: workout.rpe,
    speedMiles: toOptionalNumber(workout.speedMiles),
    tags: Array.from(new Set(cleanedTags)),
    title,
    totalBikeMiles: toOptionalNumber(workout.totalBikeMiles),
    totalRowKs: toOptionalNumber(workout.totalRowKs),
    totalRunMiles: toOptionalNumber(workout.totalRunMiles),
    totalSkiKs: toOptionalNumber(workout.totalSkiKs),
    trainingMinutes: workout.trainingMinutes,
    vo2Miles: toOptionalNumber(workout.vo2Miles),
    wallballs: toOptionalNumber(workout.wallballs),
    week,
    workoutDate,
    workoutPlan,
  });
};

const assertAdmin = async (ctx: QueryCtx | MutationCtx) => {
  const user = await authComponent.safeGetAuthUser(ctx);

  if (!user || user.role !== "admin") {
    throw new ConvexError("Only admins can manage workouts.");
  }
};

const isVisibleWorkout = (workout: { isHidden?: boolean }) =>
  workout.isHidden !== true;

export const createWorkout = mutation({
  args: {
    workout: workoutInputValidator,
  },
  handler: async (ctx, { workout }) => {
    await assertAdmin(ctx);
    return await ctx.db.insert("workouts", normalizeWorkout(workout));
  },
});

export const updateWorkout = mutation({
  args: {
    workout: workoutInputValidator,
    workoutId: v.id("workouts"),
  },
  handler: async (ctx, { workout, workoutId }) => {
    await assertAdmin(ctx);
    const existingWorkout = await ctx.db.get(workoutId);

    if (!existingWorkout) {
      throw new ConvexError("Workout not found.");
    }

    await ctx.db.replace(workoutId, normalizeWorkout(workout));
    return workoutId;
  },
});

export const setWorkoutVisibility = mutation({
  args: {
    isHidden: v.boolean(),
    workoutId: v.id("workouts"),
  },
  handler: async (ctx, { isHidden, workoutId }) => {
    await assertAdmin(ctx);
    const existingWorkout = await ctx.db.get(workoutId);

    if (!existingWorkout) {
      throw new ConvexError("Workout not found.");
    }

    await ctx.db.patch(workoutId, { isHidden });
    return workoutId;
  },
});

export const getWorkoutById = query({
  args: {
    workoutId: v.id("workouts"),
  },
  handler: async (ctx, { workoutId }) => {
    await assertAdmin(ctx);
    const workout = await ctx.db.get(workoutId);

    if (!workout) {
      return null;
    }

    return workout;
  },
});

export const getWorkoutsForAdmin = query({
  args: {
    includeHidden: v.optional(v.boolean()),
  },
  handler: async (ctx, { includeHidden }) => {
    await assertAdmin(ctx);

    const workouts = await ctx.db
      .query("workouts")
      .withIndex("by_workout_date")
      .order("desc")
      .collect();

    if (includeHidden === false) {
      return workouts.filter(isVisibleWorkout);
    }

    return workouts;
  },
});

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

    const workouts = (await workoutsQuery.collect()).filter(isVisibleWorkout);

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

    const workouts = (await workoutsQuery.collect()).filter(isVisibleWorkout);

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
    return (
      await ctx.db
        .query("workouts")
        .filter((q) =>
          q.and(
            q.gte(q.field("workoutDate"), from),
            q.lte(q.field("workoutDate"), to),
          ),
        )
        .collect()
    ).filter(isVisibleWorkout);
  },
});

export const getWorkoutsDateRange = query({
  handler: async (ctx) => {
    const visibleWorkouts = (await ctx.db.query("workouts").collect()).filter(
      isVisibleWorkout,
    );

    if (visibleWorkouts.length === 0) {
      return {
        maxWorkoutDate: null,
        minWorkoutDate: null,
      };
    }

    const sortedVisibleWorkouts = [...visibleWorkouts].sort((a, b) =>
      a.workoutDate.localeCompare(b.workoutDate),
    );

    return {
      maxWorkoutDate: sortedVisibleWorkouts[sortedVisibleWorkouts.length - 1],
      minWorkoutDate: sortedVisibleWorkouts[0],
    };
  },
});
