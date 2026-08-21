import { IconCalendar, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { TagBadge } from "@/components/workouts/tag-badge";
import { formatWorkoutDate, parseQueryDate } from "@/lib/utils";
import type { WorkoutLibraryItem } from "@/lib/workout-library";

interface WorkoutLibraryRowProps {
  onSelect: (workoutId: WorkoutLibraryItem["_id"]) => void;
  workout: WorkoutLibraryItem;
}

export function WorkoutLibraryRow({
  onSelect,
  workout,
}: WorkoutLibraryRowProps) {
  const date = parseQueryDate(workout.workoutDate);

  return (
    <article className="h-full rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition-shadow hover:border-foreground/20 hover:shadow-md">
      <div className="flex h-full min-w-0 flex-col">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-3 text-xs text-muted-foreground">
            <time
              className="inline-flex shrink-0 items-center gap-1.5 tabular-nums"
              dateTime={workout.workoutDate}
            >
              <IconCalendar aria-hidden className="size-3.5" />
              {date ? formatWorkoutDate(date) : workout.workoutDate}
            </time>
            {workout.trainingBlock ? (
              <span className="min-w-0 truncate">
                {workout.trainingBlock.title}
              </span>
            ) : (
              <span className="min-w-0 truncate">No training block</span>
            )}
          </div>

          <h3 className="mt-2 text-base leading-snug font-semibold tracking-tight text-pretty">
            {workout.title}
          </h3>

          {workout.tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {workout.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t pt-3">
          <dl className="flex items-center gap-4 text-sm tabular-nums">
            <div>
              <dt className="text-xs text-muted-foreground">Duration</dt>
              <dd className="font-medium">{workout.trainingMinutes} min</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">RPE</dt>
              <dd className="font-medium">{workout.rpe}</dd>
            </div>
          </dl>

          <Button
            onClick={() => onSelect(workout._id)}
            size="sm"
            type="button"
            variant="outline"
          >
            Details
            <IconChevronRight aria-hidden data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </article>
  );
}
