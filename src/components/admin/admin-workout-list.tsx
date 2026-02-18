"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { IconLoader2, IconPlus } from "@tabler/icons-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import type { Preloaded } from "convex/react";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { redirect } from "next/navigation";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { api } from "../../../convex/_generated/api";
import { api as convexApi } from "../../../convex/_generated/api";
import {
  FILTER_OPTIONS,
  FILTER_VALUES,
  type FilterValue,
  formatDateLabel,
  isValidFilterValue,
  type Workout,
} from "./workout-form-utils";
import { WorkoutPaginationControls } from "./workout-pagination-controls";

interface AdminWorkoutListProps {
  preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 10;
const pageSizeOptions = [10, 25, 50];

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

const fadeIn = {
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: 8 },
  transition: { duration: 0.2 },
};

export const AdminWorkoutList = ({
  preloadedUserQuery,
}: AdminWorkoutListProps) => {
  const user = usePreloadedAuthQuery(preloadedUserQuery);
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

  const filteredWorkouts = useMemo(() => {
    if (!workouts) return [];
    if (filterValue === FILTER_VALUES.visible) {
      return workouts.filter((w) => w.isHidden !== true);
    }
    if (filterValue === FILTER_VALUES.hidden) {
      return workouts.filter((w) => w.isHidden === true);
    }
    return workouts;
  }, [filterValue, workouts]);

  const pageCount = Math.max(Math.ceil(filteredWorkouts.length / pageSize), 1);
  const currentPage = Math.min(Math.max(pageQuery, 1), pageCount);

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  const handleToggleVisibility = async (workout: Workout) => {
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
      setPendingVisibilityId(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update visibility.",
      );
      setPendingVisibilityId(null);
    }
  };

  const columnHelper = createColumnHelper<Workout>();
  const workoutTableColumns = [
    columnHelper.accessor("workoutDate", {
      cell: (info) => (
        <span className="whitespace-nowrap">
          {formatDateLabel(info.getValue())}
        </span>
      ),
      header: "Date",
    }),
    columnHelper.accessor("title", {
      cell: (info) => (
        <div className="min-w-40">
          <p className="font-medium">{info.getValue()}</p>
          <p className="text-muted-foreground text-xs">
            {info.row.original.tags.join(", ")}
          </p>
        </div>
      ),
      header: "Workout",
    }),
    columnHelper.accessor("week", {
      cell: (info) => (
        <span className="whitespace-nowrap">{info.getValue()}</span>
      ),
      header: "Week",
    }),
    columnHelper.display({
      cell: (info) => (
        <div className="text-sm tabular-nums">
          <p>RPE {info.row.original.rpe}</p>
          <p className="text-muted-foreground text-xs">
            {info.row.original.trainingMinutes} min
          </p>
        </div>
      ),
      header: "Load",
      id: "load",
    }),
    columnHelper.display({
      cell: (info) => (
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-1 text-xs font-medium",
            info.row.original.isHidden
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
          )}
        >
          {info.row.original.isHidden ? "Hidden" : "Visible"}
        </span>
      ),
      header: "Visibility",
      id: "visibility",
    }),
    columnHelper.display({
      cell: (info) => {
        const workout = info.row.original;
        const workoutId = workout._id.toString();
        const isPending = pendingVisibilityId === workoutId;

        return (
          <div className="flex items-center justify-end gap-2">
            <Button asChild className="min-h-9" size="sm" variant="outline">
              <Link href={`/admin/workout/${workoutId}`}>Edit</Link>
            </Button>
            <Button
              className="min-h-9"
              disabled={isPending}
              onClick={() => handleToggleVisibility(workout)}
              size="sm"
              type="button"
              variant="outline"
            >
              {isPending ? (
                <>
                  <IconLoader2 aria-hidden className="animate-spin" />
                  <span>Saving…</span>
                </>
              ) : workout.isHidden ? (
                "Show"
              ) : (
                "Hide"
              )}
            </Button>
          </div>
        );
      },
      header: () => <div className="text-right">Actions</div>,
      id: "actions",
    }),
  ];

  const paginationState: PaginationState = {
    pageIndex: Math.max(currentPage - 1, 0),
    pageSize,
  };

  const workoutTable = useReactTable({
    columns: workoutTableColumns,
    data: filteredWorkouts,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(paginationState) : updater;
      void setPageQuery(Math.max(next.pageIndex + 1, 1));
      if (next.pageSize !== pageSize) {
        void setPageSizeQuery(next.pageSize);
      }
    },
    state: {
      pagination: paginationState,
    },
  });

  const rows = workoutTable.getRowModel().rows;

  return (
    <motion.div
      {...fadeIn}
      className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-2 sm:px-4 md:gap-6"
    >
      <div aria-atomic aria-live="polite" className="sr-only">
        {statusMessage || errorMessage || ""}
      </div>

      <Card className="px-1 sm:px-2">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl">
                Workout Admin
              </CardTitle>
              <CardDescription>
                Manage workouts, control visibility, and add new entries.
              </CardDescription>
              <p className="text-muted-foreground text-xs">
                Signed in as {user.email}
              </p>
            </div>
            <Button asChild className="min-h-11">
              <Link href="/admin/workout/new">
                <IconPlus aria-hidden />
                <span>New Workout</span>
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <AnimatePresence>
        {errorMessage ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 text-destructive rounded-lg border border-destructive/30 px-4 py-3 text-sm"
            exit={{ opacity: 0, y: -4 }}
            initial={{ opacity: 0, y: -4 }}
            role="alert"
            transition={{ duration: 0.15 }}
          >
            {errorMessage}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Card className="px-1 sm:px-2">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg">
                Logged Workouts
              </CardTitle>
              <CardDescription>
                Browse workouts, edit entries, or toggle visibility.
              </CardDescription>
            </div>
            <div className="bg-muted inline-flex rounded-md p-1">
              {FILTER_OPTIONS.map((option) => (
                <button
                  aria-pressed={filterValue === option.value}
                  className={cn(
                    "text-muted-foreground min-h-11 min-w-20 rounded px-3 py-2 text-sm font-medium transition-colors",
                    filterValue === option.value &&
                      "bg-background text-foreground shadow-sm",
                  )}
                  key={option.value}
                  onClick={() => {
                    void setFilterQuery(option.value);
                    void setPageQuery(1);
                  }}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {workouts === undefined ? (
            <div className="text-muted-foreground py-6 text-sm">
              Loading workouts…
            </div>
          ) : filteredWorkouts.length === 0 ? (
            <div className="text-muted-foreground py-6 text-sm">
              No workouts found for this filter.
            </div>
          ) : (
            <>
              <WorkoutPaginationControls
                pageSizeOptions={pageSizeOptions}
                table={workoutTable}
                totalFilteredCount={filteredWorkouts.length}
              />

              {/* Mobile cards */}
              <div className="md:hidden">
                <div className="grid grid-cols-1 gap-3">
                  {rows.map((row) => {
                    const workout = row.original;
                    const workoutId = workout._id.toString();
                    const isPending = pendingVisibilityId === workoutId;

                    return (
                      <article
                        className="border-border bg-card rounded-xl border px-3 py-3 transition-colors sm:px-4"
                        key={row.id}
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">
                            {workout.title}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatDateLabel(workout.workoutDate)} •{" "}
                            {workout.week}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            RPE {workout.rpe} • {workout.trainingMinutes} min
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {workout.tags.join(", ")}
                          </p>
                          {workout.isHidden ? (
                            <p className="text-xs font-medium text-amber-700 dark:text-amber-500">
                              Hidden
                            </p>
                          ) : (
                            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                              Visible
                            </p>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Button
                            asChild
                            className="min-h-11"
                            variant="outline"
                          >
                            <Link href={`/admin/workout/${workoutId}`}>
                              Edit
                            </Link>
                          </Button>
                          <Button
                            className="min-h-11"
                            disabled={isPending}
                            onClick={() => handleToggleVisibility(workout)}
                            type="button"
                            variant="outline"
                          >
                            {isPending ? (
                              <>
                                <IconLoader2
                                  aria-hidden
                                  className="animate-spin"
                                />
                                <span>Saving…</span>
                              </>
                            ) : workout.isHidden ? (
                              "Show"
                            ) : (
                              "Hide"
                            )}
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden md:block">
                <div className="border-border overflow-x-auto rounded-xl border">
                  <table className="w-full min-w-[900px] border-collapse text-sm">
                    <thead className="bg-muted/50">
                      {workoutTable.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              className="text-muted-foreground px-3 py-2 text-left text-xs font-semibold tracking-wide"
                              key={header.id}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr className="border-border/70 border-t" key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <td className="px-3 py-3 align-top" key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
