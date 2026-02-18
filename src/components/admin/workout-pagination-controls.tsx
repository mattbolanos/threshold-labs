import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { Workout } from "./workout-form-utils";

type WorkoutPaginationControlsProps = {
  pageSizeOptions: number[];
  table: Table<Workout>;
  totalFilteredCount: number;
};

export function WorkoutPaginationControls({
  pageSizeOptions,
  table,
  totalFilteredCount,
}: WorkoutPaginationControlsProps) {
  const start =
    totalFilteredCount === 0
      ? 0
      : table.getState().pagination.pageIndex *
          table.getState().pagination.pageSize +
        1;
  const end =
    totalFilteredCount === 0
      ? 0
      : Math.min(
          start + table.getRowModel().rows.length - 1,
          totalFilteredCount,
        );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2">
      <p className="text-muted-foreground text-xs sm:text-sm">
        Showing {start}-{end} of {totalFilteredCount} workouts
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label
          className="text-muted-foreground text-xs"
          htmlFor="workout-page-size"
        >
          Rows
        </label>
        <select
          className="bg-background min-h-11 rounded-md border px-2 text-sm"
          id="workout-page-size"
          onChange={(event) => table.setPageSize(Number(event.target.value))}
          value={table.getState().pagination.pageSize}
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Button
          className="min-h-11"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          type="button"
          variant="outline"
        >
          Previous
        </Button>
        <Button
          className="min-h-11"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          type="button"
          variant="outline"
        >
          Next
        </Button>
        <p className="text-muted-foreground w-20 text-center text-xs sm:text-sm">
          Page {table.getState().pagination.pageIndex + 1}/
          {Math.max(table.getPageCount(), 1)}
        </p>
      </div>
    </div>
  );
}
