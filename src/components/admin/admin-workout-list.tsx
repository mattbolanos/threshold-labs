"use client";

import {
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { useMutation, useQuery } from "convex/react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { formatWorkoutDate } from "@/lib/utils";
import { api as convexApi } from "../../../convex/_generated/api";
import {
  FILTER_VALUES,
  type FilterValue,
  isValidFilterValue,
  type Workout,
} from "./workout-form-utils";
import { LoggedWorkoutsSection } from "./workout-list/logged-workouts-section";
import { getWorkoutColumns } from "./workout-list/workout-table-columns";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 10;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withMinimumDuration<T>(promise: Promise<T>, minimumMs = 350) {
  const startedAt = Date.now();
  try {
    return await promise;
  } finally {
    const elapsed = Date.now() - startedAt;
    if (elapsed < minimumMs) {
      await wait(minimumMs - elapsed);
    }
  }
}

export const AdminWorkoutList = () => {
  const workouts = useQuery(convexApi.workouts.getWorkoutsForAdmin, {
    includeHidden: true,
  });
  const setWorkoutVisibility = useMutation(
    convexApi.workouts.setWorkoutVisibility,
  );

  const [filterQuery, setFilterQuery] = useQueryState(
    "filter",
    parseAsString.withDefault(FILTER_VALUES.all),
  );
  const [pageQuery, setPageQuery] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );
  const [pageSizeQuery, setPageSizeQuery] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  );
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );

  const [pendingVisibilityId, setPendingVisibilityId] = useState<string | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filterValue: FilterValue = isValidFilterValue(filterQuery)
    ? filterQuery
    : FILTER_VALUES.all;

  const pageSize = PAGE_SIZE_OPTIONS.includes(
    pageSizeQuery as (typeof PAGE_SIZE_OPTIONS)[number],
  )
    ? pageSizeQuery
    : DEFAULT_PAGE_SIZE;

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const filteredWorkouts = useMemo(() => {
    if (!workouts?.length) return [];

    return workouts.filter((workout) => {
      if (filterValue === FILTER_VALUES.visible && workout.isHidden === true) {
        return false;
      }

      if (filterValue === FILTER_VALUES.hidden && workout.isHidden !== true) {
        return false;
      }

      if (!normalizedSearchQuery) {
        return true;
      }

      const title = workout.title?.toLowerCase() ?? "";
      const tags = workout.tags?.join(", ").toLowerCase() ?? "";
      const week = workout.week?.toLowerCase() ?? "";
      const date = formatWorkoutDate(
        new Date(workout.workoutDate),
      ).toLowerCase();
      const rawDate = workout.workoutDate?.toLowerCase() ?? "";

      return (
        title.includes(normalizedSearchQuery) ||
        tags.includes(normalizedSearchQuery) ||
        week.includes(normalizedSearchQuery) ||
        date.includes(normalizedSearchQuery) ||
        rawDate.includes(normalizedSearchQuery)
      );
    });
  }, [filterValue, normalizedSearchQuery, workouts]);

  const pageCount = Math.max(Math.ceil(filteredWorkouts.length / pageSize), 1);
  const currentPage = Math.min(Math.max(pageQuery, 1), pageCount);

  const handleToggleVisibility = useCallback(
    async (workout: Workout) => {
      setErrorMessage(null);
      const workoutId = workout._id.toString();
      setPendingVisibilityId(workoutId);
      const nextIsHidden = workout.isHidden !== true;

      try {
        await withMinimumDuration(
          setWorkoutVisibility({
            isHidden: nextIsHidden,
            workoutId: workout._id,
          }),
        );
        setStatusMessage(
          nextIsHidden ? "Workout hidden." : "Workout is now visible.",
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to update visibility.",
        );
      }
      setPendingVisibilityId(null);
    },
    [setWorkoutVisibility],
  );

  const columns = useMemo(
    () =>
      getWorkoutColumns({
        onToggleVisibility: (workout) => {
          void handleToggleVisibility(workout);
        },
        pendingVisibilityId,
      }),
    [handleToggleVisibility, pendingVisibilityId],
  );

  const paginationState: PaginationState = {
    pageIndex: Math.max(currentPage - 1, 0),
    pageSize,
  };

  const workoutTable = useReactTable({
    columns,
    data: filteredWorkouts,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(paginationState) : updater;

      if (next.pageSize !== pageSize) {
        void setPageSizeQuery(next.pageSize);
      }

      void setPageQuery(Math.max(next.pageIndex + 1, 1));
    },
    state: {
      pagination: paginationState,
    },
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <div aria-atomic aria-live="polite" className="sr-only">
        {statusMessage || errorMessage || ""}
      </div>

      {errorMessage ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      <LoggedWorkoutsSection
        filteredWorkouts={filteredWorkouts}
        filterValue={filterValue}
        onFilterChange={(nextFilter) => {
          void setFilterQuery(nextFilter);
          void setPageQuery(1);
        }}
        onSearchChange={(nextSearch) => {
          void setSearchQuery(nextSearch);
          void setPageQuery(1);
        }}
        onToggleVisibility={(workout) => {
          void handleToggleVisibility(workout);
        }}
        pendingVisibilityId={pendingVisibilityId}
        searchQuery={searchQuery}
        workouts={workouts}
        workoutTable={workoutTable}
      />
    </div>
  );
};
