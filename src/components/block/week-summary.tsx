"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateSTL, cn } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

type Workouts = Doc<"workouts">;
interface WeekSummaryProps {
  workouts: Workouts[] | undefined;
  className?: string;
}

const ONE_DECIMAL_FORMAT = {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
};

const oneDecimalFormatter = new Intl.NumberFormat("en-US", ONE_DECIMAL_FORMAT);

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

function isCardioWorkout(workout: Workouts) {
  const hasDistance =
    (workout.totalRunMiles ?? 0) > 0 ||
    (workout.totalBikeMiles ?? 0) > 0 ||
    (workout.totalSkiKs ?? 0) > 0 ||
    (workout.totalRowKs ?? 0) > 0;

  if (hasDistance) return true;

  return workout.tags.some((tag) => CARDIO_TAGS.has(tag));
}

function SummaryMetric({
  label,
  loading,
  value,
}: {
  label: string;
  loading?: boolean;
  value: number;
}) {
  const isLargeValue = label === "Subjective Load";
  return (
    <div className="min-h-13 rounded-lg border bg-card px-3 py-2">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <div className="mt-0.5 flex items-end gap-3">
        {loading ? (
          <Skeleton className={cn("h-7 w-11", isLargeValue && "w-18")} />
        ) : (
          <span className="text-xl font-bold tabular-nums">
            {oneDecimalFormatter.format(value)}
          </span>
        )}
      </div>
    </div>
  );
}

export function WeekSummary({ workouts, className }: WeekSummaryProps) {
  const isLoading = workouts === undefined;
  const weeklyWorkouts = workouts ?? [];

  const totalTrainingMinutes = weeklyWorkouts.reduce(
    (sum, workout) => sum + (workout.trainingMinutes || 0),
    0,
  );
  const totalRunMiles = weeklyWorkouts.reduce(
    (sum, workout) => sum + (workout.totalRunMiles || 0),
    0,
  );
  const totalCardioMinutes = weeklyWorkouts.reduce(
    (sum, workout) =>
      isCardioWorkout(workout) ? sum + (workout.trainingMinutes || 0) : sum,
    0,
  );
  const totalSubjectiveTrainingLoad = weeklyWorkouts.reduce(
    (sum, workout) =>
      sum +
      calculateSTL(
        workout.rpe,
        workout.trainingMinutes,
        workout.totalRunMiles ?? null,
      ),
    0,
  );

  return (
    <Card
      className={cn(
        "hidden min-h-38 gap-0 rounded-xl border bg-card py-0 text-card-foreground lg:flex",
        className,
      )}
    >
      <CardHeader className="gap-1 px-5 pt-4 pb-0">
        <CardTitle className="text-base font-bold">Weekly Summary</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          A fast read on the selected week.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 px-5 pt-3 pb-4 sm:grid-cols-2">
        <SummaryMetric
          label="True Training Hours"
          loading={isLoading}
          value={totalTrainingMinutes / 60}
        />
        <SummaryMetric
          label="Subjective Training Load"
          loading={isLoading}
          value={totalSubjectiveTrainingLoad}
        />
        <SummaryMetric
          label="Run Miles"
          loading={isLoading}
          value={totalRunMiles}
        />
        <SummaryMetric
          label="Cardio Hours"
          loading={isLoading}
          value={totalCardioMinutes / 60}
        />
      </CardContent>
    </Card>
  );
}
