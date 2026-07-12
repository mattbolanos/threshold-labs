"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatOneDecimal } from "@/lib/utils";
import { getWeekSummary } from "@/lib/workout-summary";
import type { Doc } from "../../../convex/_generated/dataModel";

type Workouts = Doc<"workouts">;
interface WeekSummaryProps {
  workouts: Workouts[] | undefined;
  className?: string;
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
            {formatOneDecimal(value)}
          </span>
        )}
      </div>
    </div>
  );
}

export function WeekSummary({ workouts, className }: WeekSummaryProps) {
  const isLoading = workouts === undefined;
  const weeklyWorkouts = workouts ?? [];
  const summary = getWeekSummary(weeklyWorkouts);

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
          value={summary.trainingHours}
        />
        <SummaryMetric
          label="Subjective Training Load"
          loading={isLoading}
          value={summary.subjectiveLoad}
        />
        <SummaryMetric
          label="Run Miles"
          loading={isLoading}
          value={summary.runMiles}
        />
        <SummaryMetric
          label="Cardio Hours"
          loading={isLoading}
          value={summary.cardioHours}
        />
      </CardContent>
    </Card>
  );
}
