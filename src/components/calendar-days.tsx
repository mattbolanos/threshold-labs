"use client";

import { useCalendar } from "@/hooks/use-calendar";
import { cn, getWeekDays, isSameDay } from "@/lib/utils";

export function CalendarDays() {
  const { weekStartDate, selectedDayDate, setSelectedDay } = useCalendar();

  const weekDays = getWeekDays(weekStartDate);

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((day) => {
        const isSelected = isSameDay(selectedDayDate, day);

        return (
          <div key={day.toISOString()}>
            <div className="bg-card col-span-1 hidden cursor-pointer flex-col items-center justify-center rounded-md border py-1 font-medium md:flex">
              <span className="text-xs opacity-70">
                {day.toLocaleString("default", {
                  weekday: "short",
                })}
              </span>
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full tabular-nums",
                  isSelected ? "bg-primary text-primary-foreground" : "",
                )}
              >
                {day.getDate()}
              </span>
            </div>
            <button
              className="bg-card col-span-1 flex w-full cursor-pointer flex-col items-center justify-center rounded-md border py-1 font-medium md:hidden"
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              type="button"
            >
              <span className="text-xs opacity-70">
                {day.toLocaleString("default", {
                  weekday: "short",
                })}
              </span>
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full tabular-nums",
                  isSelected ? "bg-primary text-primary-foreground" : "",
                )}
              >
                {day.getDate()}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
