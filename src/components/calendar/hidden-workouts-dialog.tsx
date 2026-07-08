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
import { cn } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

type Workout = Doc<"workouts">;

const DAY_DIALOG_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  weekday: "long",
});

const BLOCK_ACCENT_CLASS_BY_TAG: Record<string, string> = {
  "Aerobic Cross Training": "bg-[#0f54fa]",
  "Aerobic Run": "bg-[#0f5439]",
  "Bad Heart Rate Data": "bg-[#839288]",
  "Muscular Endurance": "bg-[#fa0f4d]",
  "Quality Cross Training": "bg-[#0f54fa]",
  "Quality HYROX": "bg-[#f57808]",
  "Quality Running": "bg-[#f5a61f]",
  Race: "bg-[#fa0f4d]",
  Sleds: "bg-[#0f54fa]",
  Strength: "bg-[#f57808]",
};

interface HiddenWorkoutsDialogProps {
  day: Date;
  hiddenWorkoutCount: number;
  visibleWorkoutCount: number;
  workouts: Workout[];
}

function getBlockAccentClass(workout: Workout) {
  const tag = workout.tags[0];

  if (!tag) return "bg-[#6ee542]";

  return BLOCK_ACCENT_CLASS_BY_TAG[tag] ?? "bg-[#6ee542]";
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
          <button
            aria-label={`Show all ${workouts.length} workouts for ${dayLabel}`}
            className="group/more hidden h-[30px] w-full items-center justify-center gap-1.5 rounded-[7px] border border-[#1d2721] bg-[#050807] px-2 text-[11px] leading-[14px] font-semibold text-[#6ee542] transition-[background-color,border-color,box-shadow,transform] duration-150 outline-none hover:border-[#6ee542]/35 hover:bg-[#0a0f0c] focus-visible:border-[#6ee542]/70 focus-visible:ring-2 focus-visible:ring-[#6ee542]/25 active:translate-y-px lg:inline-flex"
            type="button"
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
        className="max-h-[86svh] gap-0 overflow-hidden border-[#1d2721] bg-[#050807] p-0 text-[#ecf1e9] shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:max-w-[860px]"
        showCloseButton={false}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#1d2721] px-4 py-3.5">
          <DialogHeader className="gap-1">
            <DialogTitle className="text-[15px] leading-5 font-semibold text-[#ecf1e9]">
              All workouts
            </DialogTitle>
            <DialogDescription className="text-[12px] leading-4 text-[#839288]">
              {dayLabel}, {workouts.length}{" "}
              {workouts.length === 1 ? "workout" : "workouts"}
            </DialogDescription>
          </DialogHeader>
          <DialogClose
            render={
              <button
                aria-label="Close workouts"
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#839288] transition-[background-color,color] outline-none hover:bg-[#0f1712] hover:text-[#ecf1e9] focus-visible:ring-2 focus-visible:ring-[#6ee542]/30"
                type="button"
              />
            }
          >
            <IconX aria-hidden className="size-4" />
          </DialogClose>
        </div>
        <div className="grid h-[72svh] max-h-[640px] min-h-0 grid-cols-[minmax(220px,280px)_minmax(0,1fr)]">
          <div className="h-full overflow-y-auto border-r border-[#1d2721] p-2">
            <fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0">
              <legend className="sr-only">Workout list</legend>
              {workouts.map((workout) => {
                const workoutId = workout._id.toString();
                const isSelected = workoutId === selectedWorkout._id.toString();

                return (
                  <button
                    aria-label={`View details for ${workout.title}`}
                    aria-pressed={isSelected}
                    className={cn(
                      "relative min-h-[56px] overflow-hidden rounded-[7px] border px-3 py-2 text-left transition-[background-color,border-color,box-shadow] duration-150 outline-none",
                      isSelected
                        ? "border-[#6ee542]/40 bg-[#0b120d] shadow-[inset_0_0_0_1px_rgba(110,229,66,0.08)]"
                        : "border-[#141d19] bg-[#080c0a] hover:border-[#1d2721] hover:bg-[#0a0f0c]",
                    )}
                    key={workoutId}
                    onClick={() => setSelectedWorkoutId(workoutId)}
                    type="button"
                  >
                    <span
                      className={cn(
                        "absolute inset-y-[-1px] left-[-1px] w-[3px] rounded-[2px]",
                        getBlockAccentClass(workout),
                      )}
                    />
                    <span className="flex min-w-0 items-start justify-between gap-2 pl-1">
                      <span className="min-w-0 truncate text-[12px] leading-[15px] font-semibold text-[#ecf1e9]">
                        {workout.title}
                      </span>
                    </span>
                    <span className="mt-1 flex min-w-0 items-center gap-1 pl-1 text-[11px] leading-[14px] text-[#839288]">
                      <span className="tabular-nums">
                        {formatBlockDuration(workout.trainingMinutes)}
                      </span>
                      <span aria-hidden>-</span>
                      <span className="tabular-nums">RPE {workout.rpe}</span>
                    </span>
                  </button>
                );
              })}
            </fieldset>
          </div>
          <div className="h-full min-w-0 overflow-y-auto p-4">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate text-[17px] leading-[22px] font-semibold text-[#ecf1e9]">
                  {selectedWorkout.title}
                </h3>
                <p className="mt-1 text-[12px] leading-4 text-[#839288]">
                  Workout {selectedWorkoutIndex + 1} of {workouts.length}
                </p>
              </div>
            </div>
            <div className="[&_.text-muted-foreground]:text-[#839288] [&_[data-slot=separator]]:bg-[#1d2721]">
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
