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

export function CalendarBlocks() {
  const { weekStartDate } = useCalendarNav();

  const [data] = api.internal.getWorkouts.useSuspenseQuery({
    from: formatQueryDate(weekStartDate),
    to: formatQueryDate(addDays(weekStartDate, 6)),
  });

  const weekDays = getWeekDays(weekStartDate);

  return (
    <div className="grid max-h-[76svh] grid-cols-1 gap-4 overflow-y-auto md:max-h-none md:grid-cols-7 md:gap-2">
      {weekDays.map((day) => {
        const dayString = formatQueryDate(day);
        const dayWorkouts = data.filter(
          (workout) => workout.workoutDate === dayString,
        );

        const isToday = isSameDay(new Date(), day);

        return (
          <div className="flex flex-col" key={dayString}>
            <h3
              className={cn(
                "bg-background sticky top-0 z-10 pb-3 text-sm font-semibold md:hidden",
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
