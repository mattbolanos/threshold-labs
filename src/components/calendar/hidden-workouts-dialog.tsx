"use client";

import { IconChevronRight, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { BlockContent } from "@/components/block/block-content";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getTagAccentOverflowCount,
  TagAccentMarker,
} from "@/components/workouts/tag-accent-marker";
import type { WorkoutWithTrainingBlock } from "@/lib/training-blocks";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

type Workout = WorkoutWithTrainingBlock;

const DAY_DIALOG_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  weekday: "long",
});

interface HiddenWorkoutsDialogProps {
  day: Date;
  hiddenWorkoutCount: number;
  visibleWorkoutCount: number;
  workouts: Workout[];
}

function formatBlockDuration(minutes: number) {
  const roundedMinutes = Math.round(minutes);
  const hours = Math.floor(roundedMinutes / 60);
  const mins = roundedMinutes % 60;

  return `${hours}:${mins.toString().padStart(2, "0")}`;
}

export function HiddenWorkoutsDialog({
  day,
  hiddenWorkoutCount,
  visibleWorkoutCount,
  workouts,
}: HiddenWorkoutsDialogProps) {
  const firstHiddenWorkout = workouts[visibleWorkoutCount];
  const initialWorkout = firstHiddenWorkout ?? workouts[0];
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(
    initialWorkout?._id.toString() ?? "",
  );

  if (!initialWorkout) return null;

  const selectedWorkout =
    workouts.find((workout) => workout._id.toString() === selectedWorkoutId) ??
    initialWorkout;
  const selectedWorkoutIndex = workouts.findIndex(
    (workout) => workout._id.toString() === selectedWorkout._id.toString(),
  );
  const dayLabel = DAY_DIALOG_DATE_FORMATTER.format(day);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          setSelectedWorkoutId(initialWorkout._id.toString());
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            aria-label={`Show all ${workouts.length} workouts for ${dayLabel}`}
            className="group/more hidden h-7.5 w-full items-center justify-center gap-1.5 rounded-lg border bg-background px-2 text-xs font-semibold text-primary transition-all duration-150 outline-none hover:border-primary/35 hover:bg-accent focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/25 active:translate-y-px lg:inline-flex"
            type="button"
            variant="outline"
          />
        }
      >
        <span className="truncate">
          +{hiddenWorkoutCount} more{" "}
          {hiddenWorkoutCount === 1 ? "workout" : "workouts"}
        </span>
        <IconChevronRight
          aria-hidden
          className="size-3.5 transition-transform duration-150 group-hover/more:translate-x-0.5"
        />
      </DialogTrigger>
      <DialogContent
        className="max-h-svh gap-0 overflow-hidden bg-popover p-0 text-popover-foreground shadow-xl sm:max-w-4xl"
        showCloseButton={false}
      >
        <div className="flex items-start justify-between gap-4 border-b px-4 py-3.5">
          <DialogHeader className="gap-1">
            <DialogTitle className="text-sm font-semibold">
              All workouts
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {dayLabel}, {workouts.length}{" "}
              {workouts.length === 1 ? "workout" : "workouts"}
            </DialogDescription>
          </DialogHeader>
          <DialogClose
            render={
              <button
                aria-label="Close workouts"
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
                type="button"
              />
            }
          >
            <IconX aria-hidden className="size-4" />
          </DialogClose>
        </div>
        <div className="grid h-dvh max-h-132 min-h-0 grid-cols-3">
          <div className="col-span-1 h-full overflow-y-auto border-r p-2">
            <fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0">
              <legend className="sr-only">Workout list</legend>
              {workouts.map((workout) => {
                const workoutId = workout._id.toString();
                const isSelected = workoutId === selectedWorkout._id.toString();
                const tagOverflowCount = getTagAccentOverflowCount(
                  workout.tags,
                );
                const tagLabel =
                  workout.tags.length > 0 ? workout.tags.join(", ") : "No tags";

                return (
                  <button
                    aria-label={`View details for ${workout.title}, tags: ${tagLabel}`}
                    aria-pressed={isSelected}
                    className={cn(
                      "relative min-h-14 overflow-hidden rounded-lg border px-3 py-2 text-left transition-all duration-150 outline-none",
                      isSelected
                        ? "border-primary/40 bg-accent shadow-inner"
                        : "bg-card hover:border-border hover:bg-accent",
                    )}
                    key={workoutId}
                    onClick={() => setSelectedWorkoutId(workoutId)}
                    title={tagLabel}
                    type="button"
                  >
                    <TagAccentMarker tags={workout.tags} />
                    <span className="flex min-w-0 items-start justify-between gap-2 pl-1">
                      <span className="min-w-0 truncate text-xs font-semibold">
                        {workout.title}
                      </span>
                      {tagOverflowCount > 0 && (
                        <span
                          aria-hidden
                          className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums"
                        >
                          +{tagOverflowCount}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 flex min-w-0 items-center gap-1 pl-1 text-xs text-muted-foreground">
                      <span className="tabular-nums">
                        {formatBlockDuration(workout.trainingMinutes)}
                      </span>
                      <span aria-hidden>•</span>
                      <span className="tabular-nums">RPE {workout.rpe}</span>
                    </span>
                  </button>
                );
              })}
            </fieldset>
          </div>
          <div className="col-span-2 h-full min-w-0 overflow-y-auto p-4">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold">
                  {selectedWorkout.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Workout {selectedWorkoutIndex + 1} of {workouts.length}
                </p>
              </div>
            </div>
            <div>
              <BlockContent
                className="mb-0 px-0 md:ms-0"
                workout={selectedWorkout}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
