"use client";

import { Block } from "@/components/block/block";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { useDayOfWeek } from "@/hooks/use-day-of-week";
import {
  cn,
  formatQueryDate,
  getMonthDateRange,
  getWeekDays,
} from "@/lib/utils";
import { api } from "@/trpc/react";

export function CalendarBlocks() {
  const { weekStartDate } = useCalendarNav();
  const { dayOfWeek } = useDayOfWeek();
  const { from, to } = getMonthDateRange(weekStartDate);

  const [data] = api.internal.getWorkouts.useSuspenseQuery({
    from: formatQueryDate(from),
    to: formatQueryDate(to),
  });

  const weekDays = getWeekDays(weekStartDate);

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
      {weekDays.map((day) => {
        const dayString = formatQueryDate(day);
        const dayWorkouts = data.filter(
          (workout) => workout.workoutDate === dayString,
        );

        const isSelected = day.getDay() === dayOfWeek;

        return (
          <div
            className={cn(
              "flex flex-col gap-2",
              isSelected ? "flex" : "hidden md:flex",
            )}
            key={day.toISOString()}
          >
            {isSelected && (
              <span className="py-2 text-center font-semibold md:hidden">
                {day.toLocaleString("default", {
                  day: "numeric",
                  month: "short",
                  weekday: "long",
                  year: "numeric",
                })}
              </span>
            )}
            {dayWorkouts.length === 0 && (
              <span className="text-muted-foreground py-2 text-center md:hidden">
                No activities found
              </span>
            )}
            {dayWorkouts.map((workout) => (
              <Block key={workout.id} workout={workout} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
