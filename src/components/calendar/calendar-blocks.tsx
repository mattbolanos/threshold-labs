"use client";

import { Block } from "@/components/block/block";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { useDayOfWeek } from "@/hooks/use-day-of-week";
import { addDays, cn, formatQueryDate, getWeekDays } from "@/lib/utils";
import { api } from "@/trpc/react";

export function CalendarBlocks() {
  const { weekStartDate } = useCalendarNav();
  const { dayOfWeek } = useDayOfWeek();

  const [data] = api.internal.getWorkouts.useSuspenseQuery({
    from: formatQueryDate(weekStartDate),
    to: formatQueryDate(addDays(weekStartDate, 6)),
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
              <span className="py-2 font-semibold md:hidden">
                {day.toLocaleString("default", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
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
