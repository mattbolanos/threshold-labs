"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { addDays, formatQueryDate } from "@/lib/utils";
import { api } from "@/trpc/react";

export function CalendarArrows() {
  const { addWeektoStart, jumpToToday, subtractWeekfromStart, weekStartDate } =
    useCalendarNav();

  // prefetch last week
  api.internal.getWorkouts.usePrefetchQuery({
    from: formatQueryDate(addDays(weekStartDate, -7)),
    to: formatQueryDate(addDays(weekStartDate, -1)),
  });

  // prefetch next week
  api.internal.getWorkouts.usePrefetchQuery({
    from: formatQueryDate(addDays(weekStartDate, 7)),
    to: formatQueryDate(addDays(weekStartDate, 13)),
  });

  return (
    <ButtonGroup>
      <ButtonGroup>
        <Button
          aria-label="Go Back"
          className="hidden md:inline-flex"
          onMouseDown={subtractWeekfromStart}
          size="icon-sm"
          variant="ghost"
        >
          <ArrowLeftIcon className="size-5" />
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button
          aria-label="Go to Today"
          className="hidden md:inline-flex"
          onMouseDown={jumpToToday}
          size="sm"
          variant="ghost"
        >
          Today
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button
          aria-label="Go Forward"
          className="hidden md:inline-flex"
          onMouseDown={addWeektoStart}
          size="icon-sm"
          variant="ghost"
        >
          <ArrowRightIcon className="size-5" />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
