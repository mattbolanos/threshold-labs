"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { addDays } from "@/lib/utils";

interface CalendarArrowsProps {
  maxWorkoutDatePromise: Promise<string | undefined>;
}

export function CalendarArrows({ maxWorkoutDatePromise }: CalendarArrowsProps) {
  const maxWorkoutDate = React.use(maxWorkoutDatePromise);
  const { addWeektoStart, jumpToToday, subtractWeekfromStart, weekStartDate } =
    useCalendarNav();

  const canGoForward = React.useMemo(() => {
    if (!maxWorkoutDate) return false;
    return new Date(maxWorkoutDate) > addDays(weekStartDate, 7);
  }, [maxWorkoutDate, weekStartDate]);

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
          disabled={!canGoForward}
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
