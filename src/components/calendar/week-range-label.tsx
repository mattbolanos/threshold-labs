"use client";

import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { formatWeekRangeLabel } from "@/lib/utils";

export function WeekRangeLabel() {
  const { weekStartDate } = useCalendarNav();

  const headerLabel = formatWeekRangeLabel(weekStartDate, true);

  return (
    <div className="ml-auto flex min-w-0 lg:ml-0">
      <span className="text-sm font-normal text-muted-foreground tabular-nums">
        {headerLabel}
      </span>
    </div>
  );
}
