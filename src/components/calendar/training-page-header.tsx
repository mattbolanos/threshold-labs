"use client";

import { WeekNavigation } from "@/components/calendar/week-navigation";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { formatWeekRangeLabel } from "@/lib/utils";

export function TrainingPageHeader() {
  const { weekStartDate } = useCalendarNav();
  const weekLabel = formatWeekRangeLabel(weekStartDate, true);

  return (
    <section className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Training
        </p>
        <h1 className="mt-3 text-3xl font-bold">Week of {weekLabel}</h1>
        <p className="max-w-3xl text-muted-foreground">
          Stephen&apos;s selected training week with the schedule, weekly
          totals, and load trends.
        </p>
      </div>
      <div className="w-full lg:w-auto lg:shrink-0 lg:pt-9">
        <WeekNavigation />
      </div>
    </section>
  );
}
