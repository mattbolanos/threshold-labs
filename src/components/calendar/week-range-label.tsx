"use client";

import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { formatWeekRangeLabel } from "@/lib/utils";

export function WeekRangeLabel() {
  const { weekStartDate } = useCalendarNav();

  const headerLabel = formatWeekRangeLabel(weekStartDate);
  const mobileHeaderLabel = formatWeekRangeLabel(
    weekStartDate,
    "default",
    true,
  );

  return (
    <div className="flex flex-col">
      <span className="hidden text-lg font-semibold tracking-tight tabular-nums lg:flex">
        {headerLabel}
      </span>
      <span className="text-base font-semibold tracking-tight tabular-nums lg:hidden">
        {mobileHeaderLabel}
      </span>
    </div>
  );
}
