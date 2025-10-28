"use client";

import { useWeekStart } from "@/hooks/use-week-start";
import { addDays, formatQueryDate, getWeekDays } from "@/lib/utils";
import { api } from "@/trpc/react";
import { CalendarBlock } from "./calendar-block";

export function CalendarBlocks() {
  const { weekStartDate } = useWeekStart();

  const [data] = api.internal.getWorkouts.useSuspenseQuery({
    from: formatQueryDate(weekStartDate),
    to: formatQueryDate(addDays(weekStartDate, 6)),
  });

  const weekDays = getWeekDays(weekStartDate);

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((day) => {
        const dayString = formatQueryDate(day);
        const dayWorkouts = data.filter(
          (workout) => workout.workoutDate === dayString,
        );

        return (
          <div className="flex flex-col gap-2" key={day.toISOString()}>
            {dayWorkouts.map((workout) => (
              <CalendarBlock key={workout.id} workout={workout} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
