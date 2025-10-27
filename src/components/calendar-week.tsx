"use client";

import { CalendarBlock } from "@/components/calendar-block";
import { useWeekStart } from "@/hooks/use-week-start";
import { cn, getWeekDays, isSameDay } from "@/lib/utils";

export function CalendarWeek() {
  const { weekStart } = useWeekStart();

  const weekDays = getWeekDays(weekStart);
  const today = new Date();

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((day) => {
        const isToday = isSameDay(today, day);
        return (
          <div className="flex flex-col gap-2" key={day.toISOString()}>
            <div className="bg-card col-span-1 flex flex-col items-center justify-center rounded-md border py-1 font-medium">
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
            <div className="flex flex-col gap-2">
              {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(
                (_, index) => (
                  <CalendarBlock key={index} />
                ),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
