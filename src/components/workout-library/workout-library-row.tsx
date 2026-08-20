import {
  IconCalendar,
  IconCalendarWeek,
  IconChevronRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { TagBadge } from "@/components/workouts/tag-badge";
import { cn, formatWorkoutDate, parseQueryDate } from "@/lib/utils";
import {
  getWorkoutWeekStart,
  type WorkoutLibraryItem,
} from "@/lib/workout-library";

interface WorkoutLibraryRowProps {
  onSelect: (workoutId: WorkoutLibraryItem["_id"]) => void;
  workout: WorkoutLibraryItem;
}

export function WorkoutLibraryRow({
  onSelect,
  workout,
}: WorkoutLibraryRowProps) {
  const date = parseQueryDate(workout.workoutDate);
  const weekStart = getWorkoutWeekStart(workout.workoutDate);

  return (
    <article className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition hover:border-foreground/20 hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <time
              className="inline-flex items-center gap-1.5 tabular-nums"
              dateTime={workout.workoutDate}
            >
              <IconCalendar aria-hidden className="size-3.5" />
              {date ? formatWorkoutDate(date) : workout.workoutDate}
            </time>
            {workout.trainingBlock ? (
              <span className="truncate">{workout.trainingBlock.title}</span>
            ) : (
              <span>No training block</span>
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

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t pt-3 md:justify-end md:border-t-0 md:pt-0">
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

          <div className="flex items-center gap-1">
            <Link
              className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
              href={`/lab/training?weekStart=${weekStart}`}
              target="_blank"
            >
              <IconCalendarWeek aria-hidden data-icon="inline-start" />
              View week
            </Link>
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
      </div>
    </article>
  );
}
