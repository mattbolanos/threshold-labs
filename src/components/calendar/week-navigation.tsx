"use client";

import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import { useConvex, useQuery } from "convex/react";
import {
  addDays,
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
import { formatQueryDate } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";

export function WeekNavigation() {
  const convex = useConvex();
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
  const previousWeekCandidate = addWeeks(selectedWeekStart, -1);
  const previousWeekStart = canGoBack
    ? minWorkoutWeekStart &&
      isBefore(previousWeekCandidate, minWorkoutWeekStart)
      ? minWorkoutWeekStart
      : previousWeekCandidate
    : null;
  const nextWeekCandidate = addWeeks(selectedWeekStart, 1);
  const nextWeekStart = canGoForward
    ? isAfter(nextWeekCandidate, latestNavigableWeekStart)
      ? latestNavigableWeekStart
      : nextWeekCandidate
    : null;

  const prewarmWeek = (targetWeekStart: Date | null) => {
    if (!targetWeekStart) {
      return;
    }

    convex.prewarmQuery({
      args: {
        from: formatQueryDate(targetWeekStart),
        to: formatQueryDate(addDays(targetWeekStart, 6)),
      },
      query: api.workouts.getWorkouts,
    });
  };

  const goToPreviousWeek = () => {
    if (!previousWeekStart) {
      return;
    }

    void setWeekStart(previousWeekStart);

    const weekBeforePrevious = addWeeks(previousWeekStart, -1);
    if (
      !minWorkoutWeekStart ||
      !isBefore(weekBeforePrevious, minWorkoutWeekStart)
    ) {
      prewarmWeek(weekBeforePrevious);
    }
  };

  const goToNextWeek = () => {
    if (!nextWeekStart) {
      return;
    }

    void setWeekStart(nextWeekStart);

    const weekAfterNext = addWeeks(nextWeekStart, 1);
    if (!isAfter(weekAfterNext, latestNavigableWeekStart)) {
      prewarmWeek(weekAfterNext);
    }
  };

  return (
    <ButtonGroup className="w-full lg:w-fit">
      <ButtonGroup className="mr-auto hidden lg:flex">
        <Button
          aria-label="Previous week"
          disabled={!canGoBack}
          onClick={goToPreviousWeek}
          onFocus={() => prewarmWeek(previousWeekStart)}
          onPointerEnter={() => prewarmWeek(previousWeekStart)}
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
          onFocus={() => prewarmWeek(previousWeekStart)}
          onPointerEnter={() => prewarmWeek(previousWeekStart)}
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
          onFocus={() => prewarmWeek(currentWeekStart)}
          onPointerEnter={() => prewarmWeek(currentWeekStart)}
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
          onFocus={() => prewarmWeek(currentWeekStart)}
          onPointerEnter={() => prewarmWeek(currentWeekStart)}
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
          onFocus={() => prewarmWeek(nextWeekStart)}
          onPointerEnter={() => prewarmWeek(nextWeekStart)}
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
          onFocus={() => prewarmWeek(nextWeekStart)}
          onPointerEnter={() => prewarmWeek(nextWeekStart)}
          size="icon-sm"
          variant="outline"
        >
          <IconArrowNarrowRight className="size-5" />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
