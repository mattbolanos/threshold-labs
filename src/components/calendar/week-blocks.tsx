"use client";

import { useQuery } from "convex/react";
import { addDays, isSameDay } from "date-fns";
import { Block } from "@/components/block/block";
import { EmptyWeekState } from "@/components/block/empty-week-state";
import { DailyLoadBar } from "@/components/calendar/daily-load-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { calculateSTL, cn, formatQueryDate, getWeekDays } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import { HiddenWorkoutsDialog } from "./hidden-workouts-dialog";

const MAX_DESKTOP_WORKOUTS_PER_DAY = 3;

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

  const data = useQuery(api.workouts.getWorkouts, {
    from: formatQueryDate(weekStartDate),
    to: formatQueryDate(addDays(weekStartDate, 6)),
  });

  const weekDays = getWeekDays(weekStartDate);

  const isLoading = data === undefined;
  const workouts = data ?? [];

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
    <div aria-busy={isLoading} data-slot="week-blocks">
      {data?.length === 0 ? (
        <div className="w-full">
          <EmptyWeekState className="bg-card text-card-foreground lg:min-h-70" />
        </div>
      ) : (
        <div className="grid w-full grid-cols-1 gap-2.5 lg:grid-cols-7">
          {weekDays.map((day) => {
            const dayString = formatQueryDate(day);
            const dayWorkouts = workoutsByDay[dayString] ?? [];
            const dailyLoad = dailyLoads[dayString] ?? 0;
            const isToday = isSameDay(new Date(), day);
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
                        isLoading={isLoading}
                        maxWeeklyDailyLoad={maxWeeklyDailyLoad}
                      />
                    </div>
                    <p className="mt-1 text-lg font-bold tabular-nums">
                      {day.getDate()}
                    </p>
                  </div>
                </div>
                <div className="flex w-full flex-1">
                  {isLoading ? (
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
  );
}
