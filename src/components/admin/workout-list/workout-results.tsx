import { IconLoader2 } from "@tabler/icons-react";
import { flexRender, type Table } from "@tanstack/react-table";
import Link from "next/link";
import type { Workout } from "@/components/admin/workout-form-utils";
import { WorkoutPaginationControls } from "@/components/admin/workout-pagination-controls";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn, formatWorkoutDate } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

type WorkoutResultsProps = {
  filteredWorkouts: Workout[];
  onToggleVisibility: (workout: Workout) => void;
  pendingVisibilityId: string | null;
  workoutTable: Table<Workout>;
};

export function WorkoutResults({
  filteredWorkouts,
  onToggleVisibility,
  pendingVisibilityId,
  workoutTable,
}: WorkoutResultsProps) {
  const rows = workoutTable.getRowModel().rows;

  return (
    <>
      <WorkoutPaginationControls
        pageSizeOptions={PAGE_SIZE_OPTIONS}
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
                    {formatWorkoutDate(new Date(workout.workoutDate))} •{" "}
                    {workout.week}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    RPE {workout.rpe} • {workout.trainingMinutes} min
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {workout.tags.join(", ")}
                  </p>
                  {workout.isHidden ? (
                    <p className="text-chart-2 text-xs font-medium">Hidden</p>
                  ) : (
                    <p className="text-primary text-xs font-medium">Visible</p>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link
                    className={buttonVariants({
                      className: "min-h-11",
                      variant: "outline",
                    })}
                    href={`/admin/workout/${workoutId}`}
                  >
                    Edit
                  </Link>
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
                        <span>Saving...</span>
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
          <table className="w-full min-w-4xl border-collapse text-sm">
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
