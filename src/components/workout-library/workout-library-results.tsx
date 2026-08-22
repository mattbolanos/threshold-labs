"use client";

import { IconCalendarStats, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { WorkoutLibraryItem } from "@/lib/workout-library";
import type { Id } from "../../../convex/_generated/dataModel";
import { WorkoutLibraryRow } from "./workout-library-row";

const MONTH_BATCH_SIZE = 6;
const SKELETON_IDS = ["first", "second", "third", "fourth", "fifth", "sixth"];

interface WorkoutMonthGroup {
  key: string;
  label: string;
  workouts: WorkoutLibraryItem[];
}

function groupWorkoutsByMonth(workouts: WorkoutLibraryItem[]) {
  const groups = new Map<string, WorkoutMonthGroup>();

  for (const workout of workouts) {
    const key = workout.workoutDate.slice(0, 7);
    const date = new Date(`${key}-01T00:00:00Z`);
    const label = date.toLocaleDateString("en-US", {
      month: "long",
      timeZone: "UTC",
      year: "numeric",
    });
    const group = groups.get(key);

    if (group) {
      group.workouts.push(workout);
    } else {
      groups.set(key, { key, label, workouts: [workout] });
    }
  }

  return Array.from(groups.values());
}

interface WorkoutLibraryResultsProps {
  hasActiveFilters: boolean;
  isLoading: boolean;
  onReset: () => void;
  onSelectWorkout: (workoutId: Id<"workouts">) => void;
  totalWorkoutCount: number;
  workouts: WorkoutLibraryItem[];
}

export function WorkoutLibraryResults({
  hasActiveFilters,
  isLoading,
  onReset,
  onSelectWorkout,
  totalWorkoutCount,
  workouts,
}: WorkoutLibraryResultsProps) {
  const [visibleMonthCount, setVisibleMonthCount] = useState(MONTH_BATCH_SIZE);
  const monthGroups = groupWorkoutsByMonth(workouts);
  const visibleMonthGroups = monthGroups.slice(0, visibleMonthCount);
  const remainingMonthCount = monthGroups.length - visibleMonthGroups.length;

  return (
    <section aria-labelledby="workout-results-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2
            className="text-lg font-semibold tracking-tight"
            id="workout-results-heading"
          >
            Training timeline
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Browse workouts grouped by month
          </p>
        </div>
        <output
          aria-live="polite"
          className="text-sm text-muted-foreground tabular-nums"
        >
          {isLoading
            ? "Loading workouts"
            : `${workouts.length} of ${totalWorkoutCount}`}
        </output>
      </div>

      {isLoading ? (
        <output
          aria-busy="true"
          aria-label="Loading workouts"
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          {SKELETON_IDS.map((id) => (
            <div className="rounded-xl border bg-card p-4 shadow-sm" key={id}>
              <Skeleton className="h-3 w-40" />
              <Skeleton className="mt-3 h-5 w-full max-w-md" />
              <Skeleton className="mt-3 h-5 w-52" />
            </div>
          ))}
        </output>
      ) : workouts.length === 0 ? (
        <Empty className="min-h-64 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconSearch aria-hidden />
            </EmptyMedia>
            <EmptyTitle>
              {hasActiveFilters
                ? "No workouts match these filters"
                : "No workouts published yet"}
            </EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "Try a broader date range or remove one of the filters."
                : "Published workouts will appear here when they are available."}
            </EmptyDescription>
          </EmptyHeader>
          {hasActiveFilters ? (
            <EmptyContent>
              <Button onClick={onReset} type="button" variant="outline">
                Reset filters
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ) : (
        <div className="flex flex-col gap-8">
          {visibleMonthGroups.map((group) => (
            <section aria-labelledby={`month-${group.key}`} key={group.key}>
              <div className="mb-2 flex items-center gap-2 border-b pb-2">
                <IconCalendarStats
                  aria-hidden
                  className="size-4 text-primary"
                />
                <h3
                  className="font-semibold tracking-tight"
                  id={`month-${group.key}`}
                >
                  {group.label}
                </h3>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {group.workouts.length} workouts
                </span>
              </div>
              <ul className="overflow-hidden rounded-xl border bg-card shadow-sm">
                {group.workouts.map((workout) => (
                  <WorkoutLibraryRow
                    key={workout._id}
                    onSelect={onSelectWorkout}
                    workout={workout}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {remainingMonthCount > 0 ? (
        <div className="mt-5 flex justify-center">
          <Button
            onClick={() =>
              setVisibleMonthCount((count) => count + MONTH_BATCH_SIZE)
            }
            type="button"
            variant="outline"
          >
            Show {Math.min(MONTH_BATCH_SIZE, remainingMonthCount)} more months
          </Button>
        </div>
      ) : null}
    </section>
  );
}
