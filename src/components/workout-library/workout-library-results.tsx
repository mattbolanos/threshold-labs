"use client";

import { IconSearch } from "@tabler/icons-react";
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

const PAGE_SIZE = 24;
const SKELETON_IDS = ["first", "second", "third", "fourth", "fifth", "sixth"];

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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleWorkouts = workouts.slice(0, visibleCount);
  const remainingCount = workouts.length - visibleWorkouts.length;

  return (
    <section aria-labelledby="workout-results-heading">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2
          className="text-lg font-semibold tracking-tight"
          id="workout-results-heading"
        >
          Workouts
        </h2>
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleWorkouts.map((workout) => (
            <WorkoutLibraryRow
              key={workout._id}
              onSelect={onSelectWorkout}
              workout={workout}
            />
          ))}
        </div>
      )}

      {remainingCount > 0 ? (
        <div className="mt-5 flex justify-center">
          <Button
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            type="button"
            variant="outline"
          >
            Show {Math.min(PAGE_SIZE, remainingCount)} more workouts
          </Button>
        </div>
      ) : null}
    </section>
  );
}
