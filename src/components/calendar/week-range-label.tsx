"use client";

import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { formatWeekRangeLabel } from "@/lib/utils";

export function WeekRangeLabel() {
  const { weekStartDate } = useCalendarNav();

  const headerLabel = formatWeekRangeLabel(weekStartDate, true);

  return (
    <div className="flex min-w-0">
      <span className="text-[13px] leading-4 font-normal tabular-nums text-[#839288]">
        {headerLabel}
      </span>
    </div>
  );
}
