"use client";

import { useCalendar } from "@/hooks/use-calendar";
import {
  addDays,
  cn,
  formatQueryDate,
  getWeekDays,
  isSameDay,
} from "@/lib/utils";
import { api } from "@/trpc/react";
import { Block } from "./block/block";

export function CalendarBlocks() {
  const { weekStartDate, selectedDayDate } = useCalendar();

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

        const isSelected = isSameDay(selectedDayDate, day);

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
                {selectedDayDate.toLocaleString("default", {
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
