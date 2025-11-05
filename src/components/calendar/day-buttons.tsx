import { useCalendar } from "@/hooks/use-calendar";
import { cn, getWeekDays, isSameDay } from "../../lib/utils";

export function DayButtons() {
  const { weekStartDate } = useCalendar();
  const weekDays = getWeekDays(weekStartDate);

  return (
    <div className="hidden grid-cols-7 gap-2 md:grid">
      {weekDays.map((day) => {
        const isToday = isSameDay(new Date(), day);

        return (
          <div
            className="bg-card col-span-1 mx-auto w-full flex-col items-center justify-center rounded-md border py-1 text-center font-medium"
            key={day.toISOString()}
          >
            <span className="text-xs opacity-70">
              {day.toLocaleString("default", {
                weekday: "short",
              })}
            </span>
            <span
              className={cn(
                "mx-auto flex size-7 items-center justify-center rounded-full tabular-nums",
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
