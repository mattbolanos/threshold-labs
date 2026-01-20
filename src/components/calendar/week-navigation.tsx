"use client";

import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import { useQuery } from "convex/react";
import { addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { api } from "../../../convex/_generated/api";

export function WeekNavigation() {
  const workoutsDateRange = useQuery(api.workouts.getWorkoutsDateRange);

  const { addWeektoStart, jumpToToday, subtractWeekfromStart, weekStartDate } =
    useCalendarNav();

  const canGoForward = !workoutsDateRange?.maxWorkoutDate
    ? false
    : new Date(workoutsDateRange?.maxWorkoutDate?.workoutDate) >
      addDays(weekStartDate, 6);

  const canGoBack = !workoutsDateRange?.minWorkoutDate
    ? false
    : new Date(workoutsDateRange?.minWorkoutDate?.workoutDate) <
      addDays(weekStartDate, -6);

  return (
    <ButtonGroup>
      <ButtonGroup className="mr-auto hidden lg:flex">
        <Button
          aria-label="Go Back"
          disabled={!canGoBack}
          onMouseDown={subtractWeekfromStart}
          size="icon-sm"
          variant="ghost"
        >
          <IconArrowNarrowLeft className="size-5" />
        </Button>
      </ButtonGroup>
      <ButtonGroup className="mr-auto lg:hidden">
        <Button
          aria-label="Go Back"
          disabled={!canGoBack}
          onMouseDown={subtractWeekfromStart}
          size="icon-sm"
          variant="outline"
        >
          <IconArrowNarrowLeft className="size-5" />
        </Button>
      </ButtonGroup>

      <ButtonGroup className="hidden lg:flex">
        <Button
          aria-label="Go to Today"
          onMouseDown={jumpToToday}
          size="sm"
          variant="outline"
        >
          Today
        </Button>
      </ButtonGroup>
      <ButtonGroup className="lg:hidden">
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
      <ButtonGroup className="ml-auto hidden lg:flex">
        <Button
          aria-label="Go Forward"
          disabled={!canGoForward}
          onMouseDown={addWeektoStart}
          size="icon-sm"
          variant="ghost"
        >
          <IconArrowNarrowRight className="size-5" />
        </Button>
      </ButtonGroup>
      <ButtonGroup className="ml-auto lg:hidden">
        <Button
          aria-label="Go Forward"
          disabled={!canGoForward}
          onMouseDown={addWeektoStart}
          size="icon-sm"
          variant="outline"
        >
          <IconArrowNarrowRight className="size-5" />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
