"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import {
  IconLoader2,
  IconPlus,
  IconSearch,
  IconUserPlus,
} from "@tabler/icons-react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  type Table,
  useReactTable,
} from "@tanstack/react-table";
import type { Preloaded } from "convex/react";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import Link from "next/link";
import { redirect } from "next/navigation";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { api } from "../../../convex/_generated/api";
import { api as convexApi } from "../../../convex/_generated/api";
import { Badge } from "../ui/badge";
import { ButtonGroup } from "../ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { TagBadge } from "../workouts/tag-badge";
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

interface AdminWorkoutListViewProps {
  errorMessage: string | null;
  filteredWorkouts: Workout[];
  filterValue: FilterValue;
  onFilterChange: (nextFilter: FilterValue) => void;
  onSearchChange: (nextSearch: string) => void;
  onToggleVisibility: (workout: Workout) => void;
  pendingVisibilityId: string | null;
  searchQuery: string;
  statusMessage: string;
  userEmail: string;
  workouts: Workout[] | undefined;
  workoutTable: Table<Workout>;
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

function getWorkoutColumns({
  onToggleVisibility,
  pendingVisibilityId,
}: {
  onToggleVisibility: (workout: Workout) => void;
  pendingVisibilityId: string | null;
}): ColumnDef<Workout>[] {
  return [
    {
      accessorKey: "workoutDate",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDateLabel(row.original.workoutDate)}
        </span>
      ),
      header: "Date",
    },
    {
      accessorKey: "title",
      cell: ({ row }) => (
        <div className="min-w-40 space-y-1">
          <p className="font-medium">{row.original.title}</p>
          <div className="flex flex-wrap items-center gap-1">
            {row.original.tags.map((tag) => (
              <TagBadge className="text-[11px]" key={tag} tag={tag} />
            ))}
          </div>
        </div>
      ),
      header: "Title",
    },
    {
      accessorKey: "week",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{row.original.week}</span>
      ),
      header: "Week",
    },
    {
      accessorKey: "rpe",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">RPE {row.original.rpe}</span>
      ),
      header: "RPE",
    },
    {
      accessorKey: "trainingMinutes",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {row.original.trainingMinutes} min
        </span>
      ),
      header: "Training mins",
    },
    {
      accessorKey: "isHidden",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          <Badge variant={row.original.isHidden ? "destructive" : "default"}>
            {row.original.isHidden ? "Hidden" : "Visible"}
          </Badge>
        </span>
      ),
      header: "Visibility",
    },
    {
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button asChild className="min-h-9" size="sm" variant="outline">
            <Link href={`/admin/workout/${row.original._id}`}>Edit</Link>
          </Button>
          <Button
            className="min-h-9"
            disabled={pendingVisibilityId === row.original._id}
            onClick={() => onToggleVisibility(row.original)}
            size="sm"
            type="button"
            variant="outline"
          >
            {pendingVisibilityId === row.original._id ? (
              <>
                <IconLoader2 aria-hidden className="animate-spin" />
                <span>Saving…</span>
              </>
            ) : row.original.isHidden ? (
              "Show"
            ) : (
              "Hide"
            )}
          </Button>
        </div>
      ),
      header: "Actions",
    },
  ];
}

function AdminWorkoutListView({
  errorMessage,
  filteredWorkouts,
  filterValue,
  onFilterChange,
  onSearchChange,
  onToggleVisibility,
  pendingVisibilityId,
  searchQuery,
  statusMessage,
  userEmail,
  workouts,
  workoutTable,
}: AdminWorkoutListViewProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div {...fadeIn} className="flex w-full flex-col gap-6">
        <div aria-atomic aria-live="polite" className="sr-only">
          {statusMessage || errorMessage || ""}
        </div>

        <div className="route-padding-x flex items-end justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-[0.15em] uppercase">
              Admin
            </p>
            <h2 className="text-lg font-semibold tracking-tight">
              Workout Manager
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Signed in as {userEmail}
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/workout/new">
              <IconPlus aria-hidden />
              <span>New Workout</span>
            </Link>
          </Button>
        </div>

        <AnimatePresence>
          {errorMessage ? (
            <m.div
              animate={{ opacity: 1, y: 0 }}
              className="route-padding-x bg-destructive/10 text-destructive border-destructive/30 rounded-lg border px-4 py-3 text-sm"
              exit={{ opacity: 0, y: -4 }}
              initial={{ opacity: 0, y: -4 }}
              role="alert"
              transition={{ duration: 0.15 }}
            >
              {errorMessage}
            </m.div>
          ) : null}
        </AnimatePresence>

        <div className="route-padding-x flex items-end justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-[0.15em] uppercase">
              Access
            </p>
            <h3 className="text-lg font-semibold tracking-tight">
              Invite Manager
            </h3>
          </div>
        </div>

        <div className="route-padding-x border-primary/20 relative border-t pt-4">
          <div className="bg-primary/40 absolute top-0 left-5 h-0.5 w-16 md:left-8" />
          <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-muted/30 py-0 shadow-sm">
            <CardHeader className="px-4 pt-4 md:px-5 md:pt-5">
              <CardTitle className="text-base font-semibold tracking-tight">
                Manage Client Invites
              </CardTitle>
              <CardDescription>
                Invite setup now lives on a dedicated page.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-5 md:pb-5">
              <Button asChild className="min-h-11">
                <Link href={{ pathname: "/admin/add-client" }}>
                  <IconUserPlus aria-hidden />
                  <span>Open Add Client</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="route-padding-x flex items-end justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-[0.15em] uppercase">
              Workouts
            </p>
            <h3 className="text-lg font-semibold tracking-tight">
              Logged Workouts
            </h3>
          </div>
          <ButtonGroup>
            {FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                onClick={() => onFilterChange(option.value)}
                size="sm"
                variant={filterValue === option.value ? "default" : "outline"}
              >
                {option.label}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        <div className="route-padding-x border-primary/20 relative border-t pt-4">
          <div className="bg-primary/40 absolute top-0 left-5 h-0.5 w-16 md:left-8" />

          <div className="flex flex-col gap-3">
            <div className="relative max-w-sm">
              <IconSearch
                aria-hidden
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              />
              <Input
                aria-label="Search workouts"
                className="pl-9"
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search by title, tag, week…"
                type="search"
                value={searchQuery}
              />
            </div>

            {workouts === undefined ? (
              <div className="text-muted-foreground py-6 text-sm">
                Loading workouts…
              </div>
            ) : filteredWorkouts.length === 0 ? (
              <Empty className="bg-muted/30 border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconSearch />
                  </EmptyMedia>
                </EmptyHeader>
                <EmptyTitle>
                  {searchQuery.trim()
                    ? "No workouts match your search."
                    : "No workouts found for this filter."}
                </EmptyTitle>
              </Empty>
            ) : (
              <WorkoutResults
                filteredWorkouts={filteredWorkouts}
                onToggleVisibility={onToggleVisibility}
                pendingVisibilityId={pendingVisibilityId}
                workoutTable={workoutTable}
              />
            )}
          </div>
        </div>
      </m.div>
    </LazyMotion>
  );
}

function WorkoutResults({
  filteredWorkouts,
  onToggleVisibility,
  pendingVisibilityId,
  workoutTable,
}: {
  filteredWorkouts: Workout[];
  onToggleVisibility: (workout: Workout) => void;
  pendingVisibilityId: string | null;
  workoutTable: Table<Workout>;
}) {
  const rows = workoutTable.getRowModel().rows;

  return (
    <>
      <WorkoutPaginationControls
        pageSizeOptions={pageSizeOptions}
        table={workoutTable}
        totalFilteredCount={filteredWorkouts.length}
      />

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
                  <p className="text-sm font-semibold">{workout.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDateLabel(workout.workoutDate)} • {workout.week}
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
                  <Button asChild className="min-h-11" variant="outline">
                    <Link href={`/admin/workout/${workoutId}`}>Edit</Link>
                  </Button>
                  <Button
                    className="min-h-11"
                    disabled={isPending}
                    onClick={() => onToggleVisibility(workout)}
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
              </article>
            );
          })}
        </div>
      </div>

      <div className="hidden md:block">
        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead className="bg-muted/50">
              {workoutTable.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      className={cn(
                        "text-muted-foreground px-3 py-2 text-xs font-semibold tracking-wide",
                        header.column.columnDef.header === "Actions"
                          ? "text-center"
                          : "text-left",
                      )}
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
  );
}

export const AdminWorkoutList = ({
  preloadedUserQuery,
}: AdminWorkoutListProps) => {
  "use no memo";

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

  const filteredWorkouts = useMemo(() => {
    if (!workouts) return [];

    let result = workouts;

    if (filterValue === FILTER_VALUES.visible) {
      result = result.filter((workout) => workout.isHidden !== true);
    } else if (filterValue === FILTER_VALUES.hidden) {
      result = result.filter((workout) => workout.isHidden === true);
    }

    const search = searchQuery.trim().toLowerCase();
    if (search) {
      result = result.filter((workout) => {
        const title = workout.title?.toLowerCase() ?? "";
        const tags = workout.tags?.join(", ").toLowerCase() ?? "";
        const week = workout.week?.toLowerCase() ?? "";
        const date = formatDateLabel(workout.workoutDate).toLowerCase();
        const rawDate = workout.workoutDate?.toLowerCase() ?? "";
        return (
          title.includes(search) ||
          tags.includes(search) ||
          week.includes(search) ||
          date.includes(search) ||
          rawDate.includes(search)
        );
      });
    }

    return result;
  }, [filterValue, searchQuery, workouts]);

  const pageCount = Math.max(Math.ceil(filteredWorkouts.length / pageSize), 1);
  const currentPage = Math.min(Math.max(pageQuery, 1), pageCount);

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

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
        setPendingVisibilityId(null);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to update visibility.",
        );
        setPendingVisibilityId(null);
      }
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
    <AdminWorkoutListView
      errorMessage={errorMessage}
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
      statusMessage={statusMessage}
      userEmail={user.email}
      workouts={workouts}
      workoutTable={workoutTable}
    />
  );
};
