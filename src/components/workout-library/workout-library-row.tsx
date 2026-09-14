import { IconChevronRight } from "@tabler/icons-react";
import { memo } from "react";
import { TagBadge } from "@/components/workouts/tag-badge";
import {
  formatShortDate,
  formatWorkoutDate,
  parseQueryDate,
} from "@/lib/utils";
import type { WorkoutLibraryItem } from "@/lib/workout-library";

interface WorkoutLibraryRowProps {
  onSelect: (workoutId: WorkoutLibraryItem["_id"]) => void;
  workout: WorkoutLibraryItem;
}

export const WorkoutLibraryRow = memo(function WorkoutLibraryRow({
  onSelect,
  workout,
}: WorkoutLibraryRowProps) {
  const date = parseQueryDate(workout.workoutDate);

  return (
    <li className="border-b text-card-foreground last:border-b-0">
      <button
        aria-label={`View details for ${workout.title} on ${
          date ? formatWorkoutDate(date) : workout.workoutDate
        }`}
        className="group grid w-full min-w-0 grid-cols-12 items-center gap-x-2 gap-y-1 p-3 text-left transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:gap-3 sm:p-4"
        onClick={() => onSelect(workout._id)}
        type="button"
      >
        <span className="col-span-3 row-span-2 min-w-0 self-start sm:col-span-2 sm:row-span-1 sm:self-center">
          <time
            className="block text-sm font-medium tabular-nums"
            dateTime={workout.workoutDate}
          >
            {date ? formatShortDate(date) : workout.workoutDate}
          </time>
          <span className="block truncate text-xs text-muted-foreground">
            {workout.trainingBlock?.title ?? "No training block"}
          </span>
        </span>

        <span className="col-span-7 min-w-0 sm:col-span-6">
          <span className="block truncate text-sm font-semibold tracking-tight sm:text-base">
            {workout.title}
          </span>
          {workout.tags.length > 0 ? (
            <span className="mt-1 flex flex-wrap gap-1.5">
              {workout.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </span>
          ) : null}
        </span>

        <span className="col-span-7 col-start-4 flex items-center gap-2 text-xs tabular-nums sm:col-span-3 sm:col-start-auto sm:gap-4 sm:justify-end sm:text-sm">
          <span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Duration
            </span>
            <span className="block font-medium">
              {workout.trainingMinutes} min
            </span>
          </span>
          <span className="text-muted-foreground sm:hidden">•</span>
          <span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              RPE
            </span>
            <span className="block font-medium">
              <span className="sm:hidden">RPE </span>
              {workout.rpe}
            </span>
          </span>
        </span>

        <IconChevronRight
          aria-hidden
          className="col-span-2 col-start-11 row-span-2 row-start-1 size-4 self-center justify-self-end text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground sm:col-span-1 sm:col-start-auto sm:row-span-1 sm:row-start-auto"
        />
      </button>
    </li>
  );
});
