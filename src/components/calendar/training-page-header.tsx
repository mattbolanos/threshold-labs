"use client";

import { WeekNavigation } from "@/components/calendar/week-navigation";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { formatWeekRangeLabel } from "@/lib/utils";

export function TrainingPageHeader() {
  const { weekStartDate } = useCalendarNav();
  const weekLabel = formatWeekRangeLabel(weekStartDate, true);

  return (
    <section className="route-padding-x flex flex-col gap-5 pt-3 md:flex-row md:items-start md:justify-between md:pt-6">
      <div className="min-w-0">
        <p className="text-[12px] leading-[15px] font-bold tracking-[0.18em] text-[#839288] uppercase">
          Training
        </p>
        <h1 className="mt-3 text-3xl font-bold">Week of {weekLabel}</h1>
        <p className="text-muted-foreground max-w-[720px]">
          Stephen&apos;s selected training week with the schedule, weekly
          totals, and load trends.
        </p>
      </div>
      <div className="shrink-0 md:pt-[35px]">
        <WeekNavigation />
      </div>
    </section>
  );
}
