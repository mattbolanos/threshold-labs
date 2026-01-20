"use client";

import { useQuery } from "convex/react";
import { addDays, isSameDay } from "date-fns";
import { Block } from "@/components/block/block";
import { EmptyWeekState } from "@/components/block/empty-week-state";
import { WeekSummary } from "@/components/block/week-summary";
import { CalendarBlocksSkeleton } from "@/components/skeletons/calendar-blocks";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { cn, formatQueryDate, getWeekDays } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";

export function WeekBlocks() {
  const { weekStartDate } = useCalendarNav();

  const data = useQuery(api.workouts.getWorkouts, {
    from: formatQueryDate(weekStartDate),
    to: formatQueryDate(addDays(weekStartDate, 6)),
  });

  const weekDays = getWeekDays(weekStartDate);

  // Loading state - show skeleton while data is undefined
  if (data === undefined) {
    return <CalendarBlocksSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-7 lg:gap-2">
      <WeekSummary className="mb-1 lg:hidden" workouts={data} />
      {data.length === 0 && (
        <EmptyWeekState className="w-full lg:col-span-7 lg:mt-2" />
      )}
      {weekDays.map((day) => {
        const dayString = formatQueryDate(day);
        const dayWorkouts = data.filter(
          (workout) => workout.workoutDate === dayString,
        );
        const isToday = isSameDay(new Date(), day);

        return (
          <div
            className={cn(
              "flex-col",
              dayWorkouts.length === 0 ? "hidden" : "flex gap-2",
            )}
            key={dayString}
          >
            <h3
              className={cn(
                "pb-2 text-sm font-semibold lg:hidden",
                isToday && "text-primary",
              )}
            >
              {day.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                weekday: "long",
                year: "numeric",
              })}
            </h3>
            <div className="flex flex-col gap-2">
              {dayWorkouts.map((workout) => (
                <Block key={workout._id.toString()} workout={workout} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
