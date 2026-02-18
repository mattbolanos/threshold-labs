import {
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconPencil,
  IconX,
} from "@tabler/icons-react";
import { flexRender, type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  FILTER_OPTIONS,
  type FilterValue,
  formatDateLabel,
  type Workout,
} from "./workout-form-utils";
import { WorkoutPaginationControls } from "./workout-pagination-controls";

type LoggedWorkoutsPanelProps = {
  editWorkoutId: string | null;
  filterValue: FilterValue;
  onFilterChange: (value: FilterValue) => void;
  onToggleEdit: (workout: Workout) => void;
  onToggleView: (workout: Workout) => void;
  onToggleVisibility: (workout: Workout) => void;
  pendingVisibilityId: string | null;
  table: Table<Workout>;
  totalFilteredCount: number;
  viewWorkoutId: string | null;
  workoutsAreLoading: boolean;
};

const pageSizeOptions = [10, 25, 50];

export function LoggedWorkoutsPanel({
  editWorkoutId,
  filterValue,
  onFilterChange,
  onToggleEdit,
  onToggleView,
  onToggleVisibility,
  pendingVisibilityId,
  table,
  totalFilteredCount,
  viewWorkoutId,
  workoutsAreLoading,
}: LoggedWorkoutsPanelProps) {
  const rows = table.getRowModel().rows;

  return (
    <Card className="px-1 sm:px-2">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg">
              Logged Workouts
            </CardTitle>
            <CardDescription>
              Select a workout to view, edit, or toggle visibility.
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
                onClick={() => onFilterChange(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {workoutsAreLoading ? (
          <div className="text-muted-foreground py-6 text-sm">
            Loading workouts…
          </div>
        ) : totalFilteredCount === 0 ? (
          <div className="text-muted-foreground py-6 text-sm">
            No workouts found for this filter.
          </div>
        ) : (
          <>
            <WorkoutPaginationControls
              pageSizeOptions={pageSizeOptions}
              table={table}
              totalFilteredCount={totalFilteredCount}
            />

            <div className="md:hidden">
              <div className="grid grid-cols-1 gap-3">
                {rows.map((row) => {
                  const workout = row.original;
                  const workoutId = workout._id.toString();
                  const isPending = pendingVisibilityId === workoutId;
                  const isEditing = editWorkoutId === workoutId;
                  const isViewing = viewWorkoutId === workoutId;

                  return (
                    <article
                      className={cn(
                        "rounded-xl border px-3 py-3 transition-colors sm:px-4",
                        isEditing
                          ? "border-primary/40 bg-primary/5"
                          : isViewing
                            ? "border-sky-300/50 bg-sky-100/20 dark:border-sky-600/30 dark:bg-sky-900/20"
                            : "border-border bg-card",
                      )}
                      key={row.id}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{workout.title}</p>
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
                            Hidden from user-facing queries
                          </p>
                        ) : (
                          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            Visible to users
                          </p>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button
                          className="min-h-11"
                          onClick={() => onToggleView(workout)}
                          type="button"
                          variant={isViewing ? "secondary" : "outline"}
                        >
                          <IconEye aria-hidden />
                          <span>{isViewing ? "Viewing" : "View"}</span>
                        </Button>
                        <Button
                          className="min-h-11"
                          onClick={() => onToggleEdit(workout)}
                          type="button"
                          variant={isEditing ? "secondary" : "outline"}
                        >
                          {isEditing ? (
                            <>
                              <IconX aria-hidden />
                              <span>Close</span>
                            </>
                          ) : (
                            <>
                              <IconPencil aria-hidden />
                              <span>Edit…</span>
                            </>
                          )}
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
                              <IconLoader2
                                aria-hidden
                                className="animate-spin"
                              />
                              <span>Saving…</span>
                            </>
                          ) : workout.isHidden ? (
                            <>
                              <IconEye aria-hidden />
                              <span>Show</span>
                            </>
                          ) : (
                            <>
                              <IconEyeOff aria-hidden />
                              <span>Hide</span>
                            </>
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
                    {table.getHeaderGroups().map((headerGroup) => (
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
                    {rows.map((row) => {
                      const workoutId = row.original._id.toString();

                      return (
                        <tr
                          className={cn(
                            "border-border/70 border-t",
                            workoutId === editWorkoutId &&
                              "bg-primary/5 border-primary/30",
                            workoutId === viewWorkoutId &&
                              "bg-sky-100/20 dark:bg-sky-900/20",
                          )}
                          key={row.id}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td className="px-3 py-3 align-top" key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
