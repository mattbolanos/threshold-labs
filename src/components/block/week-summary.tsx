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
  helper,
  label,
  loading,
  value,
}: {
  helper: string;
  label: string;
  loading?: boolean;
  value: number;
}) {
  const isLargeValue = label === "Subjective Load";
  return (
    <div className="min-h-[52px] rounded-[8px] border border-[#141d19] bg-[#080c0a] px-[11px] py-[7px]">
      <p className="text-[10px] leading-[13px] font-bold text-[#839288]">
        {label}
      </p>
      <div className="mt-[2px] flex items-end gap-3">
        {loading ? (
          <Skeleton className={cn("h-7 w-11", isLargeValue && "w-18")} />
        ) : (
          <span className="text-xl font-bold tabular-nums">
            {oneDecimalFormatter.format(value)}
          </span>
        )}
        <span className="text-muted-foreground ml-auto pb-1 text-xs">
          {helper}
        </span>
      </div>
    </div>
  );
}

function SummarySkeleton({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        "min-h-[154px] gap-0 rounded-[10px] border border-[#1d2721] bg-[#060a08] py-0 text-[#ecf1e9]",
        className,
      )}
    >
      <CardHeader className="gap-1 px-[19px] pt-[17px] pb-0">
        <CardTitle className="text-[17px] leading-[21px] font-bold text-[#ecf1e9]">
          Weekly Summary
        </CardTitle>
        <CardDescription className="text-[12px] leading-[15px] text-[#839288]">
          A fast read on the selected week.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 px-[19px] pt-3 pb-[17px] sm:grid-cols-2">
        <SummaryMetric
          helper="true time"
          label="Training Hours"
          loading
          value={0}
        />
        <SummaryMetric
          helper="session RPE x duration"
          label="Subjective Load"
          loading
          value={0}
        />
        <SummaryMetric
          helper="planned / completed"
          label="Run Miles"
          loading
          value={0}
        />
        <SummaryMetric
          helper="run + bike + ergs"
          label="Cardio Hours"
          loading
          value={0}
        />
      </CardContent>
    </Card>
  );
}

export function WeekSummary({ workouts, className }: WeekSummaryProps) {
  if (!workouts) return <SummarySkeleton className={className} />;

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

  return (
    <Card
      className={cn(
        "min-h-[154px] gap-0 rounded-[10px] border border-[#1d2721] bg-[#060a08] py-0 text-[#ecf1e9]",
        className,
      )}
    >
      <CardHeader className="gap-1 px-[19px] pt-[17px] pb-0">
        <CardTitle className="text-[17px] leading-[21px] font-bold text-[#ecf1e9]">
          Weekly Summary
        </CardTitle>
        <CardDescription className="text-[12px] leading-[15px] text-[#839288]">
          A fast read on the selected week.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 px-[19px] pt-3 pb-[17px] sm:grid-cols-2">
        <SummaryMetric
          helper="true time"
          label="Training Hours"
          value={totalTrainingMinutes / 60}
        />
        <SummaryMetric
          helper="session RPE x duration"
          label="Subjective Load"
          value={totalSubjectiveTrainingLoad}
        />
        <SummaryMetric
          helper="planned / completed"
          label="Run Miles"
          value={totalRunMiles}
        />
        <SummaryMetric
          helper="run + bike + ergs"
          label="Cardio Hours"
          value={totalCardioMinutes / 60}
        />
      </CardContent>
    </Card>
  );
}
