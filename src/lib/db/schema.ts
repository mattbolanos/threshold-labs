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
    cardioMinutes: integer("cardio_minutes").notNull(),
    cycle: integer("cycle").notNull(),
    id: text("id").primaryKey().notNull(),
    notes: text("notes"),
    rpe: real("rpe").notNull(),
    speedMiles: real("speed_miles"),
    subjectiveTrainingLoad: real("subjective_training_load").notNull(),
    tempoMiles: real("tempo_miles"),
    thresholdMiles: real("threshold_miles"),
    totalBikeMiles: real("total_bike_miles"),
    totalRowKs: real("total_row_ks"),
    totalRunMiles: real("total_run_miles"),
    totalSkiKs: real("total_ski_ks"),
    trainingMinutes: integer("training_minutes").notNull(),
    vo2Miles: real("vo2_miles"),
    wallballs: integer("wallballs"),
    workoutDate: date("workout_date").notNull(),
    workoutPlan: text("workout_plan").notNull(),
    workoutType: text("workout_type").notNull(),
  },
  (table) => [index("idx_workout_date").on(table.workoutDate)],
);
