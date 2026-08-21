"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { WeekNavigation } from "@/components/calendar/week-navigation";
import { PageHeader } from "@/components/page-header";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { formatWeekRangeLabel } from "@/lib/utils";

const WORKOUT_LIBRARY_PATH = "/lab/training/workouts";

function getWorkoutLibraryReturnHref(returnTo: string | null): Route {
  if (
    returnTo === WORKOUT_LIBRARY_PATH ||
    returnTo?.startsWith(`${WORKOUT_LIBRARY_PATH}?`)
  ) {
    return returnTo as Route;
  }

  return WORKOUT_LIBRARY_PATH;
}

export function TrainingPageHeader() {
  const searchParams = useSearchParams();
  const { weekStartDate } = useCalendarNav();
  const weekLabel = formatWeekRangeLabel(weekStartDate, true);
  const isFromWorkoutLibrary = searchParams.get("from") === "workout-library";
  const workoutLibraryHref = getWorkoutLibraryReturnHref(
    searchParams.get("returnTo"),
  );

  return (
    <div className="flex flex-col gap-3">
      {isFromWorkoutLibrary ? (
        <Link
          className="-ms-2 inline-flex min-h-9 self-start items-center gap-2 rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href={workoutLibraryHref}
        >
          <IconArrowLeft aria-hidden className="size-4" />
          Back to workout library
        </Link>
      ) : null}
      <PageHeader
        actions={<WeekNavigation />}
        eyebrow="Training"
        title={`Week of ${weekLabel}`}
      />
    </div>
  );
}
