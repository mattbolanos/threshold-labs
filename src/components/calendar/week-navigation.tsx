"use client";

import { addDays } from "date-fns";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { formatQueryDate } from "@/lib/utils";
import { api } from "@/trpc/react";

interface CalendarArrowsProps {
  workoutsDateRangePromise: Promise<{
    minWorkoutDate: string | null;
    maxWorkoutDate: string | null;
  }>;
}

export function WeekNavigation({
  workoutsDateRangePromise,
}: CalendarArrowsProps) {
  const workoutsDateRange = React.use(workoutsDateRangePromise);

  const { addWeektoStart, jumpToToday, subtractWeekfromStart, weekStartDate } =
    useCalendarNav();

  // prefetch last week
  api.internal.getWorkouts.usePrefetchQuery({
    from: formatQueryDate(addDays(weekStartDate, -7)),
    to: formatQueryDate(addDays(weekStartDate, -1)),
  });

  const canGoForward = !workoutsDateRange.maxWorkoutDate
    ? false
    : new Date(workoutsDateRange.maxWorkoutDate) > addDays(weekStartDate, 6);

  const canGoBack = !workoutsDateRange.minWorkoutDate
    ? false
    : new Date(workoutsDateRange.minWorkoutDate) < addDays(weekStartDate, -6);

  return (
    <ButtonGroup>
      <ButtonGroup className="mr-auto hidden md:flex">
        <Button
          aria-label="Go Back"
          disabled={!canGoBack}
          onMouseDown={subtractWeekfromStart}
          size="icon-sm"
          variant="ghost"
        >
          <ArrowLeftIcon className="size-5" />
        </Button>
      </ButtonGroup>
      <ButtonGroup className="mr-auto md:hidden">
        <Button
          aria-label="Go Back"
          disabled={!canGoBack}
          onMouseDown={subtractWeekfromStart}
          size="icon-sm"
          variant="outline"
        >
          <ArrowLeftIcon className="size-5" />
        </Button>
      </ButtonGroup>

      <ButtonGroup className="hidden md:flex">
        <Button
          aria-label="Go to Today"
          onMouseDown={jumpToToday}
          size="sm"
          variant="outline"
        >
          Today
        </Button>
      </ButtonGroup>
      <ButtonGroup className="md:hidden">
        <Button
          aria-label="Go to This Week"
          className="text-xs"
          onMouseDown={jumpToToday}
          size="sm"
          variant="outline"
        >
          This Week
        </Button>
      </ButtonGroup>
      <ButtonGroup className="ml-auto hidden md:flex">
        <Button
          aria-label="Go Forward"
          disabled={!canGoForward}
          onMouseDown={addWeektoStart}
          size="icon-sm"
          variant="ghost"
        >
          <ArrowRightIcon className="size-5" />
        </Button>
      </ButtonGroup>
      <ButtonGroup className="ml-auto md:hidden">
        <Button
          aria-label="Go Forward"
          disabled={!canGoForward}
          onMouseDown={addWeektoStart}
          size="icon-sm"
          variant="outline"
        >
          <ArrowRightIcon className="size-5" />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
