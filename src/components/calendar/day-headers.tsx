"use client";

import { isSameDay } from "date-fns";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { cn, getWeekDays } from "@/lib/utils";

export function DayHeaders() {
  const { weekStartDate } = useCalendarNav();
  const weekDays = getWeekDays(weekStartDate);

  return (
    <div className="hidden grid-cols-7 gap-2 lg:grid">
      {weekDays.map((day) => {
        const isToday = isSameDay(new Date(), day);

        return (
          <div
            className={cn(
              "col-span-1 mx-auto flex w-full flex-col items-center justify-center rounded-lg py-1.5 text-center font-medium transition-colors",
              isToday
                ? "bg-primary/8 border-primary/20 border"
                : "bg-card border",
            )}
            key={day.toISOString()}
          >
            <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
              {day.toLocaleString("default", {
                weekday: "short",
              })}
            </span>
            <span
              className={cn(
                "mx-auto flex size-7 items-center justify-center rounded-full text-sm font-semibold",
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
