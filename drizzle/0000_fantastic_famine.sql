CREATE TABLE "thlab"."workouts" (
	"burpees" integer,
	"cardio_minutes" integer NOT NULL,
	"cycle" integer NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"notes" text,
	"rpe" real NOT NULL,
	"speed_miles" real,
	"subjective_training_load" real NOT NULL,
	"tempo_miles" real,
	"threshold_miles" real,
	"total_bike_miles" real,
	"total_row_ks" real,
	"total_run_miles" real,
	"total_ski_ks" real,
	"training_minutes" integer NOT NULL,
	"vo2_miles" real,
	"wallballs" integer,
	"workout_date" date NOT NULL,
	"workout_plan" text NOT NULL,
	"workout_type" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_workout_date" ON "thlab"."workouts" USING btree ("workout_date");