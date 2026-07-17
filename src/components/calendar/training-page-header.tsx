"use client";

import { WeekNavigation } from "@/components/calendar/week-navigation";
import { PageHeader } from "@/components/page-header";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { formatWeekRangeLabel } from "@/lib/utils";

export function TrainingPageHeader() {
  const { weekStartDate } = useCalendarNav();
  const weekLabel = formatWeekRangeLabel(weekStartDate, true);

  return (
    <PageHeader
      actions={<WeekNavigation />}
      eyebrow="Training"
      title={`Week of ${weekLabel}`}
    />
  );
}
