import { calculateSTL } from "@/lib/utils";

interface WorkoutSummaryInput {
  cardioMinutes?: number | null;
  rpe: number;
  totalRunMiles?: number | null;
  trainingMinutes: number;
}

export function getWeekSummary(workouts: readonly WorkoutSummaryInput[]) {
  let cardioMinutes = 0;
  let runMiles = 0;
  let subjectiveLoad = 0;
  let trainingMinutes = 0;

  for (const workout of workouts) {
    cardioMinutes += workout.cardioMinutes ?? 0;
    runMiles += workout.totalRunMiles ?? 0;
    subjectiveLoad += calculateSTL(
      workout.rpe,
      workout.trainingMinutes,
      workout.totalRunMiles ?? null,
    );
    trainingMinutes += workout.trainingMinutes;
  }

  return {
    cardioHours: cardioMinutes / 60,
    runMiles,
    subjectiveLoad,
    trainingHours: trainingMinutes / 60,
  };
}
