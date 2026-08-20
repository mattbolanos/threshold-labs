"use client";

import { useQuery } from "convex/react";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useMemo, useState } from "react";
import { TAG_CONFIG } from "@/components/workouts/tag-config";
import {
  filterAndSortWorkouts,
  hasActiveWorkoutFilters,
  WORKOUT_DATE_MODES,
  WORKOUT_SORTS,
} from "@/lib/workout-library";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { WorkoutDetailsDialog } from "./workout-details-dialog";
import { WorkoutLibraryFiltersView } from "./workout-library-filters";
import { WorkoutLibraryResults } from "./workout-library-results";

const workoutLibraryParsers = {
  block: parseAsString.withDefault("all"),
  dateMode: parseAsStringLiteral(WORKOUT_DATE_MODES).withDefault("any"),
  from: parseAsString.withDefault(""),
  q: parseAsString.withDefault(""),
  sort: parseAsStringLiteral(WORKOUT_SORTS).withDefault("newest"),
  tags: parseAsArrayOf(parseAsString).withDefault([]),
  to: parseAsString.withDefault(""),
  week: parseAsString.withDefault(""),
};

export function WorkoutLibrary() {
  const workouts = useQuery(api.workouts.getWorkoutLibrary);
  const [queryFilters, setQueryFilters] = useQueryStates(
    workoutLibraryParsers,
    { history: "replace" },
  );
  const [selectedWorkoutId, setSelectedWorkoutId] =
    useState<Id<"workouts"> | null>(null);

  const validTags = useMemo(() => {
    const knownTags = new Set(TAG_CONFIG.map(({ tag }) => tag));
    return queryFilters.tags.filter((tag) => knownTags.has(tag));
  }, [queryFilters.tags]);
  const filters = useMemo(
    () => ({ ...queryFilters, tags: validTags }),
    [queryFilters, validTags],
  );

  const trainingBlocks = useMemo(() => {
    const blocks = new Map<
      string,
      { id: string; startDate: string; title: string }
    >();

    for (const workout of workouts ?? []) {
      if (workout.trainingBlock) {
        blocks.set(workout.trainingBlock._id, {
          id: workout.trainingBlock._id,
          startDate: workout.trainingBlock.startDate,
          title: workout.trainingBlock.title,
        });
      }
    }

    return Array.from(blocks.values()).toSorted((a, b) =>
      b.startDate.localeCompare(a.startDate),
    );
  }, [workouts]);

  const filteredWorkouts = useMemo(
    () => filterAndSortWorkouts(workouts ?? [], filters),
    [filters, workouts],
  );
  const resultKey = [
    filters.block,
    filters.dateMode,
    filters.from,
    filters.q,
    filters.sort,
    filters.tags.join(","),
    filters.to,
    filters.week,
  ].join("|");

  const updateFilters = (value: Partial<typeof filters>) => {
    void setQueryFilters(value);
  };

  const resetFilters = () => {
    void setQueryFilters(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <WorkoutLibraryFiltersView
        filters={filters}
        hasNoBlockWorkouts={Boolean(
          workouts?.some((workout) => workout.trainingBlock === null),
        )}
        onChange={updateFilters}
        onReset={resetFilters}
        trainingBlocks={trainingBlocks}
      />
      <WorkoutLibraryResults
        hasActiveFilters={hasActiveWorkoutFilters(filters)}
        isLoading={workouts === undefined}
        key={resultKey}
        onReset={resetFilters}
        onSelectWorkout={setSelectedWorkoutId}
        totalWorkoutCount={workouts?.length ?? 0}
        workouts={filteredWorkouts}
      />
      <WorkoutDetailsDialog
        onOpenChange={(open) => {
          if (!open) setSelectedWorkoutId(null);
        }}
        workoutId={selectedWorkoutId}
      />
    </div>
  );
}
