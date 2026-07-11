"use client";

import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import { useQuery } from "convex/react";
import { isAfter, isBefore, isSameWeek, parseISO, startOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { api } from "../../../convex/_generated/api";

export function WeekNavigation() {
  const workoutsDateRange = useQuery(api.workouts.getWorkoutsDateRange);

  const {
    addWeektoStart,
    jumpToToday,
    subtractWeekfromStart,
    today,
    weekStartDate,
  } = useCalendarNav();

  const selectedWeekStart = startOfWeek(weekStartDate, { weekStartsOn: 1 });
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const maxWorkoutWeekStart = workoutsDateRange?.maxWorkoutDate
    ? startOfWeek(parseISO(workoutsDateRange.maxWorkoutDate.workoutDate), {
        weekStartsOn: 1,
      })
    : null;
  const minWorkoutWeekStart = workoutsDateRange?.minWorkoutDate
    ? startOfWeek(parseISO(workoutsDateRange.minWorkoutDate.workoutDate), {
        weekStartsOn: 1,
      })
    : null;
  const latestNavigableWeekStart =
    maxWorkoutWeekStart && isAfter(maxWorkoutWeekStart, currentWeekStart)
      ? maxWorkoutWeekStart
      : currentWeekStart;

  const canGoForward = isBefore(selectedWeekStart, latestNavigableWeekStart);
  const canGoBack = minWorkoutWeekStart
    ? isAfter(selectedWeekStart, minWorkoutWeekStart)
    : false;
  const isCurrentWeek = isSameWeek(selectedWeekStart, currentWeekStart, {
    weekStartsOn: 1,
  });

  return (
    <ButtonGroup className="w-full lg:w-fit">
      <ButtonGroup className="mr-auto hidden lg:flex">
        <Button
          aria-label="Go Back"
          disabled={!canGoBack}
          onClick={subtractWeekfromStart}
          size="icon-sm"
          variant="ghost"
        >
          <IconArrowNarrowLeft className="size-5" />
        </Button>
      </ButtonGroup>
      <ButtonGroup className="mr-auto lg:hidden">
        <Button
          aria-label="Go Back"
          className="size-10"
          disabled={!canGoBack}
          onClick={subtractWeekfromStart}
          size="icon-sm"
          variant="outline"
        >
          <IconArrowNarrowLeft className="size-5" />
        </Button>
      </ButtonGroup>

      <ButtonGroup className="hidden lg:flex">
        <Button
          aria-label="Go to Today"
          disabled={isCurrentWeek}
          onClick={jumpToToday}
          size="sm"
          variant="outline"
        >
          Today
        </Button>
      </ButtonGroup>
      <ButtonGroup className="flex-1 lg:hidden">
        <Button
          aria-label="Go to This Week"
          className="h-10 w-full text-sm"
          disabled={isCurrentWeek}
          onClick={jumpToToday}
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
          onClick={addWeektoStart}
          size="icon-sm"
          variant="ghost"
        >
          <IconArrowNarrowRight className="size-5" />
        </Button>
      </ButtonGroup>
      <ButtonGroup className="ml-auto lg:hidden">
        <Button
          aria-label="Go Forward"
          className="size-10"
          disabled={!canGoForward}
          onClick={addWeektoStart}
          size="icon-sm"
          variant="outline"
        >
          <IconArrowNarrowRight className="size-5" />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
