"use client";

import { Block } from "@/components/block/block";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import {
  addDays,
  cn,
  formatQueryDate,
  getWeekDays,
  isSameDay,
} from "@/lib/utils";
import { api } from "@/trpc/react";
import { BlocksSummary } from "../block/summary";

export function CalendarBlocks() {
  const { weekStartDate } = useCalendarNav();

  const [data] = api.internal.getWorkouts.useSuspenseQuery({
    from: formatQueryDate(weekStartDate),
    to: formatQueryDate(addDays(weekStartDate, 6)),
  });

  const weekDays = getWeekDays(weekStartDate);

  return (
    <div className="grid max-h-[74svh] grid-cols-1 gap-4 overflow-y-auto lg:max-h-none lg:grid-cols-7 lg:gap-2">
      <BlocksSummary className="mb-2 lg:hidden" workouts={data} />
      {data.length === 0 && (
        <div className="flex items-center justify-center pt-14 lg:col-span-7 lg:pt-20">
          <span className="text-muted-foreground text-lg lg:text-xl">
            No workouts this week, yet...
          </span>
        </div>
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
              dayWorkouts.length === 0 ? "hidden lg:flex" : "flex px-1 lg:px-0",
            )}
            key={dayString}
          >
            <h3
              className={cn(
                "bg-background sticky top-0 z-10 pb-3 text-sm font-semibold lg:hidden",
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
                <Block key={workout.id} workout={workout} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
