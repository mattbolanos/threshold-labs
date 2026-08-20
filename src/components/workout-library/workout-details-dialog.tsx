"use client";

import { IconCalendarWeek } from "@tabler/icons-react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BlockContent } from "@/components/block/block-content";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatWorkoutDate, parseQueryDate } from "@/lib/utils";
import { getWorkoutWeekStart } from "@/lib/workout-library";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface WorkoutDetailsDialogProps {
  onOpenChange: (open: boolean) => void;
  workoutId: Id<"workouts"> | null;
}

export function WorkoutDetailsDialog({
  onOpenChange,
  workoutId,
}: WorkoutDetailsDialogProps) {
  const searchParams = useSearchParams();
  const workout = useQuery(
    api.workouts.getWorkoutDetails,
    workoutId ? { workoutId } : "skip",
  );
  const date = workout ? parseQueryDate(workout.workoutDate) : null;
  const libraryQuery = searchParams.toString();
  const returnTo = `/lab/training/workouts${
    libraryQuery ? `?${libraryQuery}` : ""
  }`;

  return (
    <Dialog onOpenChange={onOpenChange} open={workoutId !== null}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{workout?.title ?? "Workout details"}</DialogTitle>
          <DialogDescription>
            {workout
              ? date
                ? formatWorkoutDate(date)
                : workout.workoutDate
              : "Loading the full workout plan and notes."}
          </DialogDescription>
        </DialogHeader>

        {workout === undefined ? (
          <output
            aria-busy="true"
            aria-label="Loading workout details"
            className="flex flex-col gap-3 py-3"
          >
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </output>
        ) : workout === null ? (
          <p className="py-6 text-sm text-muted-foreground">
            This workout is no longer available.
          </p>
        ) : (
          <BlockContent className="mb-0 px-0 md:ms-0" workout={workout} />
        )}

        {workout ? (
          <DialogFooter>
            <Link
              className={cn(buttonVariants({ variant: "outline" }))}
              href={{
                pathname: "/lab/training",
                query: {
                  from: "workout-library",
                  returnTo,
                  weekStart: getWorkoutWeekStart(workout.workoutDate),
                  workoutId: workout._id,
                },
              }}
            >
              <IconCalendarWeek aria-hidden data-icon="inline-start" />
              See in weekly schedule
            </Link>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
