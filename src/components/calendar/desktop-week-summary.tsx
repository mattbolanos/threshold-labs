"use client";

import { useQuery } from "convex/react";
import { addDays } from "date-fns";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { formatOneDecimal, formatQueryDate } from "@/lib/utils";
import { getWeekSummary } from "@/lib/workout-summary";
import { api } from "../../../convex/_generated/api";

function DesktopStat({
  label,
  loading,
  unit,
  value,
}: {
  label: string;
  loading: boolean;
  unit?: string;
  value: number;
}) {
  return (
    <div className="flex min-w-20 shrink-0 flex-col items-end">
      <span className="text-xs whitespace-nowrap text-muted-foreground">
        {label}
      </span>
      <span className="min-h-6 font-semibold whitespace-nowrap tabular-nums">
        {loading ? "—" : formatOneDecimal(value)}
        {unit ? (
          <span className="ml-1 text-xs font-medium text-muted-foreground uppercase">
            {unit}
          </span>
        ) : null}
      </span>
    </div>
  );
}

export function DesktopWeekSummary() {
  const { weekStartDate } = useCalendarNav();
  const workouts = useQuery(api.workouts.getWorkouts, {
    from: formatQueryDate(weekStartDate),
    to: formatQueryDate(addDays(weekStartDate, 6)),
  });
  const summary = getWeekSummary(workouts ?? []);

  return (
    <div className="ml-auto hidden shrink-0 items-start lg:flex">
      <DesktopStat
        label="Subjective Load"
        loading={workouts === undefined}
        value={summary.subjectiveLoad}
      />
      <DesktopStat
        label="Training"
        loading={workouts === undefined}
        unit="hrs"
        value={summary.trainingHours}
      />
      <DesktopStat
        label="Run"
        loading={workouts === undefined}
        unit="mi"
        value={summary.runMiles}
      />
      <DesktopStat
        label="Cardio"
        loading={workouts === undefined}
        unit="hrs"
        value={summary.cardioHours}
      />
    </div>
  );
}
