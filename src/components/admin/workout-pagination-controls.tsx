import type { Table } from "@tanstack/react-table";
import { useId } from "react";
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
  const pageSizeId = useId();
  const {
    pagination: { pageIndex, pageSize },
  } = table.getState();
  const rowCount = table.getRowModel().rows.length;
  const pageCount = Math.max(table.getPageCount(), 1);
  const start = totalFilteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const end =
    totalFilteredCount === 0
      ? 0
      : Math.min(start + rowCount - 1, totalFilteredCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2">
      <p className="text-muted-foreground text-xs sm:text-sm">
        Showing {start}-{end} of {totalFilteredCount} workouts
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-muted-foreground text-xs" htmlFor={pageSizeId}>
          Rows
        </label>
        <select
          className="bg-background min-h-11 rounded-md border px-2 text-sm"
          id={pageSizeId}
          onChange={(event) => table.setPageSize(Number(event.target.value))}
          value={pageSize}
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
          Page {pageIndex + 1}/{pageCount}
        </p>
      </div>
    </div>
  );
}
