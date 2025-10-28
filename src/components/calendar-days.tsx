"use client";

import { useWeekStart } from "@/hooks/use-week-start";
import { cn, getWeekDays, isSameDay } from "@/lib/utils";

export function CalendarDays() {
  const { weekStartDate } = useWeekStart();

  const weekDays = getWeekDays(weekStartDate);

  const today = new Date();

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((day) => {
        const isToday = isSameDay(today, day);

        return (
          <div
            className="bg-card col-span-1 flex flex-col items-center justify-center rounded-md border py-1 font-medium"
            key={day.toISOString()}
          >
            <span className="text-xs opacity-70">
              {day.toLocaleString("default", {
                weekday: "short",
              })}
            </span>
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full tabular-nums",
                isToday ? "bg-primary text-primary-foreground" : "",
              )}
            >
              {day.getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
