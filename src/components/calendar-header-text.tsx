"use client";

import { useWeekStart } from "@/hooks/use-week-start";
import { formatWeekRangeLabel } from "@/lib/utils";

export function CalendarHeaderText() {
  const { weekStartDate } = useWeekStart();

  const headerLabel = formatWeekRangeLabel(weekStartDate);

  return (
    <span className="flex items-center gap-1 text-sm font-medium tabular-nums">
      {headerLabel} • Cycle 18
    </span>
  );
}
