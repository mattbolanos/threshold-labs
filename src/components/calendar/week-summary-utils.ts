import { calculateSTL } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

type Workout = Doc<"workouts">;

const CARDIO_TAGS = new Set([
  "Aerobic Cross Training",
  "Aerobic Run",
  "Bad Heart Rate Data",
  "Quality Cross Training",
  "Quality HYROX",
  "Quality Running",
  "Race",
  "Sleds",
]);

export const oneDecimalFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

function isCardioWorkout(workout: Workout) {
  const hasDistance =
    (workout.totalRunMiles ?? 0) > 0 ||
    (workout.totalBikeMiles ?? 0) > 0 ||
    (workout.totalSkiKs ?? 0) > 0 ||
    (workout.totalRowKs ?? 0) > 0;

  return hasDistance || workout.tags.some((tag) => CARDIO_TAGS.has(tag));
}

export function getWeekSummary(workouts: Workout[]) {
  const totalTrainingMinutes = workouts.reduce(
    (sum, workout) => sum + (workout.trainingMinutes || 0),
    0,
  );
  const totalRunMiles = workouts.reduce(
    (sum, workout) => sum + (workout.totalRunMiles || 0),
    0,
  );
  const totalCardioMinutes = workouts.reduce(
    (sum, workout) =>
      isCardioWorkout(workout) ? sum + (workout.trainingMinutes || 0) : sum,
    0,
  );
  const totalSubjectiveTrainingLoad = workouts.reduce(
    (sum, workout) =>
      sum +
      calculateSTL(
        workout.rpe,
        workout.trainingMinutes,
        workout.totalRunMiles ?? null,
      ),
    0,
  );

  return {
    cardioHours: totalCardioMinutes / 60,
    runMiles: totalRunMiles,
    subjectiveLoad: totalSubjectiveTrainingLoad,
    trainingHours: totalTrainingMinutes / 60,
  };
}
