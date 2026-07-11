"use client";

import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import { useQuery } from "convex/react";
import {
  addWeeks,
  isAfter,
  isBefore,
  isSameWeek,
  parseISO,
  startOfWeek,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { api } from "../../../convex/_generated/api";

export function WeekNavigation() {
  const workoutsDateRange = useQuery(api.workouts.getWorkoutsDateRange);

  const { jumpToToday, setWeekStart, today, weekStartDate } = useCalendarNav();

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

  const goToPreviousWeek = () => {
    void setWeekStart((weekStart) => {
      const previousWeek = addWeeks(weekStart, -1);

      if (minWorkoutWeekStart && isBefore(previousWeek, minWorkoutWeekStart)) {
        return minWorkoutWeekStart;
      }

      return previousWeek;
    });
  };

  const goToNextWeek = () => {
    void setWeekStart((weekStart) => {
      const nextWeek = addWeeks(weekStart, 1);
      return isAfter(nextWeek, latestNavigableWeekStart)
        ? latestNavigableWeekStart
        : nextWeek;
    });
  };

  return (
    <ButtonGroup className="w-full lg:w-fit">
      <ButtonGroup className="mr-auto hidden lg:flex">
        <Button
          aria-label="Previous week"
          disabled={!canGoBack}
          onClick={goToPreviousWeek}
          size="icon-sm"
          variant="ghost"
        >
          <IconArrowNarrowLeft className="size-5" />
        </Button>
      </ButtonGroup>
      <ButtonGroup className="mr-auto lg:hidden">
        <Button
          aria-label="Previous week"
          className="size-10"
          disabled={!canGoBack}
          onClick={goToPreviousWeek}
          size="icon-sm"
          variant="outline"
        >
          <IconArrowNarrowLeft className="size-5" />
        </Button>
      </ButtonGroup>

      <ButtonGroup className="hidden lg:flex">
        <Button
          aria-label="Go to current week"
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
          aria-label="Go to current week"
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
          aria-label="Next week"
          disabled={!canGoForward}
          onClick={goToNextWeek}
          size="icon-sm"
          variant="ghost"
        >
          <IconArrowNarrowRight className="size-5" />
        </Button>
      </ButtonGroup>
      <ButtonGroup className="ml-auto lg:hidden">
        <Button
          aria-label="Next week"
          className="size-10"
          disabled={!canGoForward}
          onClick={goToNextWeek}
          size="icon-sm"
          variant="outline"
        >
          <IconArrowNarrowRight className="size-5" />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
