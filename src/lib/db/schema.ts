import {
  date,
  index,
  integer,
  pgSchema,
  real,
  text,
} from "drizzle-orm/pg-core";

const thlab = pgSchema("thlab");

export const workouts = thlab.table(
  "workouts",
  {
    burpees: integer("burpees"),
    cardioMinutes: real("cardio_minutes"),
    id: text("id").primaryKey().notNull(),
    lt1Miles: real("lt1_miles"),
    lt2Miles: real("lt2_miles"),
    notes: text("notes"),
    rpe: real("rpe").notNull(),
    speedMiles: real("speed_miles"),
    subjectiveTrainingLoad: real("subjective_training_load").notNull(),
    tags: text("tags").array().notNull().default([]),
    title: text("title").notNull(),
    totalBikeMiles: real("total_bike_miles"),
    totalRowKs: real("total_row_ks"),
    totalRunMiles: real("total_run_miles"),
    totalSkiKs: real("total_ski_ks"),
    trainingMinutes: real("training_minutes").notNull(),
    vo2Miles: real("vo2_miles"),
    wallballs: integer("wallballs"),
    week: date("week").notNull(),
    workoutDate: date("workout_date").notNull(),
    workoutPlan: text("workout_plan").notNull(),
  },
  (table) => [index("idx_workout_date").on(table.workoutDate)],
);
