"use client";

import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { formatWeekRangeLabel } from "@/lib/utils";

export function CalendarHeaderText() {
  const { weekStartDate } = useCalendarNav();

  const headerLabel = formatWeekRangeLabel(weekStartDate);
  const mobileHeaderLabel = formatWeekRangeLabel(
    weekStartDate,
    "default",
    true,
  );

  return (
    <div className="flex flex-col pl-1">
      <span className="hidden text-sm font-medium tabular-nums md:flex">
        {headerLabel}
      </span>
      <span className="text-sm font-medium tabular-nums md:hidden">
        {mobileHeaderLabel}
      </span>
      <span className="text-muted-foreground hidden text-sm md:flex">
        Click on a block to view more details
      </span>
    </div>
  );
}
