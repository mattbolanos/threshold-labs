"use client";

import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { formatWeekRangeLabel } from "@/lib/utils";

export function WeekRangeLabel() {
  const { weekStartDate } = useCalendarNav();

  const headerLabel = formatWeekRangeLabel(weekStartDate, true);

  return (
    <div className="flex min-w-0">
      <span className="text-muted-foreground text-xs font-normal tabular-nums">
        {headerLabel}
      </span>
    </div>
  );
}
