"use client";

import { useCalendar } from "@/hooks/use-calendar";
import { formatWeekRangeLabel } from "@/lib/utils";

export function CalendarHeaderText() {
  const { selectedDayDate } = useCalendar();

  const headerLabel = formatWeekRangeLabel(selectedDayDate);

  return (
    <div className="flex flex-col">
      <span className="flex items-center gap-1 text-sm font-medium tabular-nums">
        {headerLabel} • Cycle 18
      </span>
      <span className="text-muted-foreground text-sm">
        Click on a block to view more details
      </span>
    </div>
  );
}
