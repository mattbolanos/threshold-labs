"use client";

import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { formatWeekRangeLabel, startOfWeek } from "@/lib/utils";

export function CalendarHeaderText() {
  const { weekStartDate } = useCalendarNav();

  const headerLabel = formatWeekRangeLabel(startOfWeek(weekStartDate));

  return (
    <div className="flex flex-col pl-1">
      <span className="flex items-center gap-1 text-sm font-medium tabular-nums">
        {headerLabel} • Cycle 18
      </span>
      <span className="text-muted-foreground text-sm">
        Click on a block to view more details
      </span>
    </div>
  );
}
