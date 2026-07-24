"use client";

import { useQuery } from "convex/react";
import { addDays } from "date-fns";
import { useState, useSyncExternalStore } from "react";
import { Block } from "@/components/block/block";
import { EmptyWeekState } from "@/components/block/empty-week-state";
import { DailyLoadBar } from "@/components/calendar/daily-load-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import {
  calculateSTL,
  cn,
  formatQueryDate,
  getWeekDays,
  parseQueryDate,
} from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import { HiddenWorkoutsDialog } from "./hidden-workouts-dialog";

const MAX_DESKTOP_WORKOUTS_PER_DAY = 3;
const subscribeToLocalDate = () => () => {};
const getLocalDate = () => formatQueryDate(new Date());
const getServerDate = () => null;

function WeekBlocksLoading() {
  return (
    <div className="flex w-full flex-1 flex-col gap-1.5">
      <Skeleton className="h-13 rounded-lg bg-muted motion-reduce:animate-none" />
      <Skeleton className="h-13 rounded-lg bg-muted motion-reduce:animate-none" />
      <Skeleton className="h-13 rounded-lg bg-muted motion-reduce:animate-none" />
    </div>
  );
}

export function WeekBlocks() {
  const { weekStartDate } = useCalendarNav();
  const localToday = useSyncExternalStore(
    subscribeToLocalDate,
    getLocalDate,
    getServerDate,
  );

  const weekKey = formatQueryDate(weekStartDate);
  const data = useQuery(api.workouts.getWorkouts, {
    from: weekKey,
    to: formatQueryDate(addDays(weekStartDate, 6)),
  });
  const [lastResolvedWeek, setLastResolvedWeek] = useState<{
    key: string;
    workouts: NonNullable<typeof data>;
  } | null>(null);

  if (
    data !== undefined &&
    (lastResolvedWeek?.key !== weekKey || lastResolvedWeek.workouts !== data)
  ) {
    setLastResolvedWeek({ key: weekKey, workouts: data });
  }

  const isLoading = data === undefined;
  const isRetainingPreviousWeek = isLoading && lastResolvedWeek !== null;
  const isInitialLoading = isLoading && !isRetainingPreviousWeek;
  const displayedWeekKey =
    data === undefined ? (lastResolvedWeek?.key ?? weekKey) : weekKey;
  const displayedWeekStart = parseQueryDate(displayedWeekKey) ?? weekStartDate;
  const weekDays = getWeekDays(displayedWeekStart);
  const workouts = data ?? lastResolvedWeek?.workouts ?? [];

  const workoutsByDay = workouts.reduce<Record<string, typeof workouts>>(
    (acc, workout) => {
      const dayWorkouts = acc[workout.workoutDate] ?? [];
      dayWorkouts.push(workout);
      acc[workout.workoutDate] = dayWorkouts;
      return acc;
    },
    {},
  );

  const dailyLoads = weekDays.reduce<Record<string, number>>((acc, day) => {
    const dayString = formatQueryDate(day);
    acc[dayString] = (workoutsByDay[dayString] ?? []).reduce(
      (total, workout) =>
        total +
        calculateSTL(
          workout.rpe,
          workout.trainingMinutes,
          workout.totalRunMiles ?? null,
        ),
      0,
    );
    return acc;
  }, {});
  const maxWeeklyDailyLoad = Math.max(0, ...Object.values(dailyLoads));

  return (
    <div aria-busy={isLoading} className="relative" data-slot="week-blocks">
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-10 rounded-lg bg-card opacity-0 transition-opacity duration-100 ease-out-quint motion-reduce:opacity-0 motion-reduce:transition-none",
          isRetainingPreviousWeek && "opacity-40 delay-150",
        )}
      />
      <div
        className={cn(isRetainingPreviousWeek && "pointer-events-none")}
        inert={isRetainingPreviousWeek}
      >
        {workouts.length === 0 && !isInitialLoading ? (
          <div className="w-full">
            <EmptyWeekState className="bg-card text-card-foreground lg:min-h-70" />
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 gap-2.5 lg:grid-cols-7">
            {weekDays.map((day) => {
              const dayString = formatQueryDate(day);
              const dayWorkouts = workoutsByDay[dayString] ?? [];
              const dailyLoad = dailyLoads[dayString] ?? 0;
              const isToday = localToday === dayString;
              const weekday = day
                .toLocaleString("en-US", { weekday: "short" })
                .toUpperCase();
              const hiddenWorkoutCount = Math.max(
                0,
                dayWorkouts.length - MAX_DESKTOP_WORKOUTS_PER_DAY,
              );
              return (
                <div
                  className={cn(
                    "flex w-full flex-col overflow-hidden rounded-lg border bg-card p-2 transition-shadow lg:min-h-70",
                    isToday && "border-primary/70 shadow-sm",
                  )}
                  key={dayString}
                >
                  <div className="mb-2 flex items-start justify-between px-1 pt-0.5">
                    <div className="w-full min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            "text-xs font-bold text-muted-foreground",
                            isToday && "text-primary",
                          )}
                        >
                          {weekday}
                        </p>
                        <DailyLoadBar
                          dailyLoad={dailyLoad}
                          isLoading={isInitialLoading}
                          maxWeeklyDailyLoad={maxWeeklyDailyLoad}
                        />
                      </div>
                      <p className="mt-1 text-lg font-bold tabular-nums">
                        {day.getDate()}
                      </p>
                    </div>
                  </div>
                  <div className="flex w-full flex-1">
                    {isInitialLoading ? (
                      <WeekBlocksLoading />
                    ) : (
                      <div className="flex w-full flex-1 flex-col gap-1.5">
                        {dayWorkouts.map((workout, workoutIndex) => (
                          <div
                            className={cn(
                              "w-full",
                              workoutIndex >= MAX_DESKTOP_WORKOUTS_PER_DAY &&
                                "lg:hidden",
                            )}
                            key={workout._id.toString()}
                          >
                            <Block className="w-full" workout={workout} />
                          </div>
                        ))}
                        {hiddenWorkoutCount > 0 && (
                          <HiddenWorkoutsDialog
                            day={day}
                            hiddenWorkoutCount={hiddenWorkoutCount}
                            visibleWorkoutCount={MAX_DESKTOP_WORKOUTS_PER_DAY}
                            workouts={dayWorkouts}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
