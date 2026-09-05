"use client";

import { useQuery } from "convex/react";
import { addDays } from "date-fns";
import type { ReactNode } from "react";
import { SUBJECTIVE_LOAD_DEFINITIONS } from "@/app/constants";
import { InfoPopover } from "@/components/chart/info-popover";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { formatOneDecimal, formatQueryDate } from "@/lib/utils";
import { getWeekSummary } from "@/lib/workout-summary";
import { api } from "../../../convex/_generated/api";

function DesktopStat({
  label,
  loading,
  tooltip,
  unit,
  value,
}: {
  label: string;
  loading: boolean;
  tooltip?: ReactNode;
  unit?: string;
  value: number;
}) {
  return (
    <div className="flex min-w-20 shrink-0 flex-col items-start">
      <div className="flex h-6 items-center gap-0.5 text-xs whitespace-nowrap text-muted-foreground">
        <span>{label}</span>
        {tooltip}
      </div>
      <span className="min-h-6 font-semibold whitespace-nowrap tabular-nums">
        {loading ? "–" : formatOneDecimal(value)}
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
  const { isRangeLoading, weekStartDate } = useCalendarNav();
  const workouts = useQuery(
    api.workouts.getWorkouts,
    isRangeLoading
      ? "skip"
      : {
          from: formatQueryDate(weekStartDate),
          to: formatQueryDate(addDays(weekStartDate, 6)),
        },
  );
  const summary = getWeekSummary(workouts ?? []);

  return (
    <div className="ml-auto hidden shrink-0 items-start lg:flex">
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
      <DesktopStat
        label="Subjective Load"
        loading={workouts === undefined}
        tooltip={
          <InfoPopover
            definitions={SUBJECTIVE_LOAD_DEFINITIONS}
            size="xs"
            title="Subjective Load"
          />
        }
        value={summary.subjectiveLoad}
      />
    </div>
  );
}
