"use client";

import { Block } from "@/components/block/block";
import { EmptyBlocks } from "@/components/block/empty-blocks";
import { BlocksSummary } from "@/components/block/summary";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import {
  addDays,
  cn,
  formatQueryDate,
  getWeekDays,
  isSameDay,
} from "@/lib/utils";
import { api } from "@/trpc/react";

export function CalendarBlocks() {
  const { weekStartDate } = useCalendarNav();

  const [data] = api.internal.getWorkouts.useSuspenseQuery({
    from: formatQueryDate(weekStartDate),
    to: formatQueryDate(addDays(weekStartDate, 6)),
  });

  const weekDays = getWeekDays(weekStartDate);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-7 md:gap-2">
      <BlocksSummary className="mb-1 md:hidden" workouts={data} />
      {data.length === 0 && (
        <EmptyBlocks className="w-full md:col-span-7 md:mt-2" />
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
                "pb-2 text-sm font-semibold md:hidden",
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
