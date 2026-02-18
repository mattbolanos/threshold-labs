"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconLoader2,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import type { Preloaded } from "convex/react";
import { useMutation, useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { LoggedWorkoutsPanel } from "@/components/admin/logged-workouts-panel";
import { WorkoutDetailsPanel } from "@/components/admin/workout-details-panel";
import { WorkoutEditorFields } from "@/components/admin/workout-editor-fields";
import {
  EMPTY_WORKOUT_FORM,
  FILTER_VALUES,
  type FilterValue,
  formatDateLabel,
  isValidFilterValue,
  toWorkoutFormState,
  validateWorkoutForm,
  type Workout,
  type WorkoutFormState,
} from "@/components/admin/workout-form-utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { api } from "../../../convex/_generated/api";
import { api as convexApi } from "../../../convex/_generated/api";

interface AdminParentProps {
  preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
}

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

export const AdminParent = ({ preloadedUserQuery }: AdminParentProps) => {
  const user = usePreloadedAuthQuery(preloadedUserQuery);
  const workouts = useQuery(convexApi.workouts.getWorkoutsForAdmin, {
    includeHidden: true,
  });
  const createWorkout = useMutation(convexApi.workouts.createWorkout);
  const updateWorkout = useMutation(convexApi.workouts.updateWorkout);
  const setWorkoutVisibility = useMutation(
    convexApi.workouts.setWorkoutVisibility,
  );

  const [filterQuery, setFilterQuery] = useQueryState(
    "filter",
    parseAsString.withDefault(FILTER_VALUES.all),
  );
  const [editWorkoutId, setEditWorkoutId] = useQueryState(
    "editWorkoutId",
    parseAsString,
  );
  const [viewWorkoutId, setViewWorkoutId] = useQueryState(
    "viewWorkoutId",
    parseAsString,
  );
  const [pageQuery, setPageQuery] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );
  const [pageSizeQuery, setPageSizeQuery] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  );

  const [createForm, setCreateForm] =
    useState<WorkoutFormState>(EMPTY_WORKOUT_FORM);
  const [editForm, setEditForm] = useState<WorkoutFormState | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateExpanded, setIsCreateExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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
  const currentPage = Math.max(pageQuery, 1);

  const selectedWorkout = useMemo(
    () =>
      workouts?.find((workout) => workout._id.toString() === editWorkoutId) ??
      null,
    [editWorkoutId, workouts],
  );

  const viewedWorkout = useMemo(
    () =>
      workouts?.find((workout) => workout._id.toString() === viewWorkoutId) ??
      null,
    [viewWorkoutId, workouts],
  );

  const filteredWorkouts = useMemo(() => {
    if (!workouts) {
      return [];
    }

    if (filterValue === FILTER_VALUES.visible) {
      return workouts.filter((workout) => workout.isHidden !== true);
    }
    if (filterValue === FILTER_VALUES.hidden) {
      return workouts.filter((workout) => workout.isHidden === true);
    }
    return workouts;
  }, [filterValue, workouts]);

  useEffect(() => {
    if (!isValidFilterValue(filterQuery)) {
      void setFilterQuery(FILTER_VALUES.all);
    }
  }, [filterQuery, setFilterQuery]);

  useEffect(() => {
    if (
      !PAGE_SIZE_OPTIONS.includes(
        pageSizeQuery as (typeof PAGE_SIZE_OPTIONS)[number],
      )
    ) {
      void setPageSizeQuery(DEFAULT_PAGE_SIZE);
    }
  }, [pageSizeQuery, setPageSizeQuery]);

  useEffect(() => {
    const pageCount = Math.max(
      Math.ceil(filteredWorkouts.length / pageSize),
      1,
    );

    if (currentPage > pageCount) {
      void setPageQuery(pageCount);
    }
  }, [filteredWorkouts.length, pageSize, currentPage, setPageQuery]);

  useEffect(() => {
    if (workouts && editWorkoutId && !selectedWorkout) {
      void setEditWorkoutId(null);
      setEditForm(null);
    }
  }, [workouts, editWorkoutId, selectedWorkout, setEditWorkoutId]);

  useEffect(() => {
    if (workouts && viewWorkoutId && !viewedWorkout) {
      void setViewWorkoutId(null);
    }
  }, [workouts, viewWorkoutId, viewedWorkout, setViewWorkoutId]);

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  const openEditor = (workout: Workout) => {
    const workoutId = workout._id.toString();
    void setEditWorkoutId(workoutId);
    void setViewWorkoutId(workoutId);
    setEditForm(toWorkoutFormState(workout));
  };

  const closeEditor = () => {
    void setEditWorkoutId(null);
    setEditForm(null);
  };

  const toggleViewer = (workout: Workout) => {
    const workoutId = workout._id.toString();
    if (viewWorkoutId === workoutId) {
      void setViewWorkoutId(null);
      return;
    }
    void setViewWorkoutId(workoutId);
  };

  const closeViewer = () => {
    void setViewWorkoutId(null);
  };

  const handleCreateFieldChange = <K extends keyof WorkoutFormState>(
    field: K,
    value: WorkoutFormState[K],
  ) => {
    setCreateForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleEditFieldChange = <K extends keyof WorkoutFormState>(
    field: K,
    value: WorkoutFormState[K],
  ) => {
    setEditForm((previous) => {
      const baseForm =
        previous ??
        (selectedWorkout ? toWorkoutFormState(selectedWorkout) : null);
      if (!baseForm) {
        return previous;
      }

      return {
        ...baseForm,
        [field]: value,
      };
    });
  };

  const handleCreateWorkout = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setErrorMessage(null);

    const validation = validateWorkoutForm(createForm);
    if (!validation.workout) {
      setErrorMessage(validation.errors[0] ?? "Please fix form errors.");
      return;
    }

    setIsCreating(true);

    try {
      await withMinimumDuration(
        createWorkout({
          workout: validation.workout,
        }),
      );
      setCreateForm(EMPTY_WORKOUT_FORM);
      setStatusMessage("Workout created.");
      setIsCreating(false);
      setIsCreateExpanded(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create workout.",
      );
      setIsCreating(false);
    }
  };

  const handleUpdateWorkout = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!selectedWorkout) {
      setErrorMessage("Select a workout to edit.");
      return;
    }

    const formToValidate = editForm ?? toWorkoutFormState(selectedWorkout);
    const validation = validateWorkoutForm(formToValidate);
    if (!validation.workout) {
      setErrorMessage(validation.errors[0] ?? "Please fix form errors.");
      return;
    }

    setIsUpdating(true);

    try {
      await withMinimumDuration(
        updateWorkout({
          workout: validation.workout,
          workoutId: selectedWorkout._id,
        }),
      );
      setStatusMessage("Workout updated.");
      setIsUpdating(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update workout.",
      );
      setIsUpdating(false);
    }
  };

  const handleToggleVisibility = async (workout: Workout) => {
    setErrorMessage(null);
    const workoutId = workout._id.toString();
    setPendingVisibilityId(workoutId);
    const nextIsHidden = workout.isHidden !== true;
    const successMessage = nextIsHidden
      ? "Workout hidden."
      : "Workout is now visible.";

    try {
      await withMinimumDuration(
        setWorkoutVisibility({
          isHidden: nextIsHidden,
          workoutId: workout._id,
        }),
      );
      setStatusMessage(successMessage);
      setPendingVisibilityId(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update visibility.",
      );
      setPendingVisibilityId(null);
    }
  };

  const activeEditForm =
    selectedWorkout === null
      ? null
      : (editForm ?? toWorkoutFormState(selectedWorkout));

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
        const isSelected = editWorkoutId === workoutId;
        const isViewing = viewWorkoutId === workoutId;

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              className="min-h-9"
              onClick={() => toggleViewer(workout)}
              size="sm"
              type="button"
              variant={isViewing ? "secondary" : "outline"}
            >
              {isViewing ? "Viewing" : "View"}
            </Button>
            <Button
              className="min-h-9"
              onClick={() => (isSelected ? closeEditor() : openEditor(workout))}
              size="sm"
              type="button"
              variant={isSelected ? "secondary" : "outline"}
            >
              {isSelected ? "Close" : "Edit…"}
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

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-2 pb-8 sm:px-4 md:gap-6">
      <div aria-atomic aria-live="polite" className="sr-only">
        {statusMessage || errorMessage || ""}
      </div>

      <Card className="px-1 sm:px-2">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Workout Admin</CardTitle>
          <CardDescription>
            Add workouts, edit logged entries, and control workout visibility.
          </CardDescription>
          <p className="text-muted-foreground text-xs">
            Signed in as {user.email}
          </p>
        </CardHeader>
      </Card>

      {errorMessage ? (
        <div
          className="bg-destructive/10 text-destructive rounded-lg border border-destructive/30 px-4 py-3 text-sm"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      <Card className="px-1 sm:px-2">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg">
                Add Workout
              </CardTitle>
              <CardDescription>
                Create a new workout record in the workouts table.
              </CardDescription>
            </div>
            <Button
              aria-expanded={isCreateExpanded}
              className="min-h-11"
              onClick={() => setIsCreateExpanded((previous) => !previous)}
              type="button"
              variant={isCreateExpanded ? "secondary" : "outline"}
            >
              {isCreateExpanded ? (
                <>
                  <IconChevronUp aria-hidden />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <IconPlus aria-hidden />
                  <span>Add Workout…</span>
                  <IconChevronDown aria-hidden />
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {isCreateExpanded ? (
          <CardContent>
            <form className="space-y-5" onSubmit={handleCreateWorkout}>
              <WorkoutEditorFields
                form={createForm}
                idPrefix="create-workout"
                onChange={handleCreateFieldChange}
              />

              <div className="flex items-center justify-end">
                <Button
                  className="min-h-11 min-w-36"
                  disabled={isCreating}
                  type="submit"
                >
                  {isCreating ? (
                    <>
                      <IconLoader2 aria-hidden className="animate-spin" />
                      <span>Add Workout…</span>
                    </>
                  ) : (
                    <>
                      <IconPlus aria-hidden />
                      <span>Add Workout</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        ) : null}
      </Card>

      <LoggedWorkoutsPanel
        editWorkoutId={editWorkoutId}
        filterValue={filterValue}
        onFilterChange={(value) => {
          void setFilterQuery(value);
          void setPageQuery(1);
        }}
        onToggleEdit={(workout) =>
          editWorkoutId === workout._id.toString()
            ? closeEditor()
            : openEditor(workout)
        }
        onToggleView={toggleViewer}
        onToggleVisibility={handleToggleVisibility}
        pendingVisibilityId={pendingVisibilityId}
        table={workoutTable}
        totalFilteredCount={filteredWorkouts.length}
        viewWorkoutId={viewWorkoutId}
        workoutsAreLoading={workouts === undefined}
      />

      <WorkoutDetailsPanel onClose={closeViewer} workout={viewedWorkout} />

      <Card className="px-1 sm:px-2">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg">
                Edit Workout
              </CardTitle>
              <CardDescription>
                {selectedWorkout
                  ? "Update the selected workout entry."
                  : "Select a workout above to edit it."}
              </CardDescription>
            </div>
            {selectedWorkout ? (
              <Button
                className="min-h-11"
                onClick={closeEditor}
                type="button"
                variant="outline"
              >
                <IconX aria-hidden />
                <span>Close Editor</span>
              </Button>
            ) : null}
          </div>
        </CardHeader>

        {selectedWorkout && activeEditForm ? (
          <CardContent>
            <form className="space-y-5" onSubmit={handleUpdateWorkout}>
              <div className="space-y-2">
                <Label
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-2"
                  htmlFor={`edit-hidden-${selectedWorkout._id}`}
                >
                  <input
                    checked={activeEditForm.isHidden}
                    id={`edit-hidden-${selectedWorkout._id}`}
                    onChange={(event) =>
                      handleEditFieldChange("isHidden", event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span>Hidden Workout</span>
                </Label>
                <p className="text-muted-foreground text-xs">
                  Hidden workouts are excluded from all app workout queries.
                </p>
              </div>

              <WorkoutEditorFields
                form={activeEditForm}
                idPrefix={`edit-${selectedWorkout._id}`}
                onChange={handleEditFieldChange}
              />

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  className="min-h-11"
                  onClick={closeEditor}
                  type="button"
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  className="min-h-11 min-w-36"
                  disabled={isUpdating}
                  type="submit"
                >
                  {isUpdating ? (
                    <>
                      <IconLoader2 aria-hidden className="animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <IconCheck aria-hidden />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
};
