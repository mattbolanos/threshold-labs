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
import { EmptyBlocks } from "../block/empty-blocks";
import { BlocksSummary } from "../block/summary";
import { ScrollArea } from "../ui/scroll-area";

export function CalendarBlocks() {
  const { weekStartDate } = useCalendarNav();

  const [data] = api.internal.getWorkouts.useSuspenseQuery({
    from: formatQueryDate(weekStartDate),
    to: formatQueryDate(addDays(weekStartDate, 6)),
  });

  const weekDays = getWeekDays(weekStartDate);

  return (
    <div className="lg:grid lg:grid-cols-7 lg:gap-2">
      {data.length === 0 && (
        <EmptyBlocks className="col-span-7 hidden lg:flex" />
      )}
      {weekDays.map((day) => {
        const dayString = formatQueryDate(day);
        const dayWorkouts = data.filter(
          (workout) => workout.workoutDate === dayString,
        );

        return (
          <div className={cn("hidden flex-col gap-2 lg:flex")} key={dayString}>
            {dayWorkouts.map((workout) => (
              <Block key={workout.id} workout={workout} />
            ))}
          </div>
        );
      })}
      <ScrollArea className="h-[79svh] p-3 lg:hidden">
        <BlocksSummary className="mb-2" workouts={data} />
        {data.length === 0 && <EmptyBlocks className="lg:hidden" />}
        <div className="flex flex-col gap-6 pt-4">
          {weekDays.map((day) => {
            const dayString = formatQueryDate(day);
            const dayWorkouts = data.filter(
              (workout) => workout.workoutDate === dayString,
            );

            const isToday = isSameDay(new Date(), day);

            return (
              <div
                className={cn(
                  "flex-col",
                  dayWorkouts.length === 0 ? "hidden" : "flex",
                )}
                key={dayString}
              >
                <h3
                  className={cn(
                    "bg-background/80 sticky top-0 z-10 pb-3 text-sm font-semibold backdrop-blur-md",
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
      </ScrollArea>
    </div>
  );
}
