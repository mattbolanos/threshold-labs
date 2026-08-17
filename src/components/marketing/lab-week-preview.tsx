import { IconHandClick, IconLock } from "@tabler/icons-react";
import { Block } from "@/components/block/block";
import type {
  LabPreviewWeek,
  LabPreviewWorkout,
} from "@/components/marketing/lab-preview-data";
import {
  formatQueryDate,
  formatWeekRangeLabel,
  getWeekDays,
  parseQueryDate,
} from "@/lib/utils";

function LockedWorkout() {
  return (
    <div className="relative min-h-16 overflow-hidden rounded-lg border border-neutral-700/70 bg-neutral-800/80">
      <div aria-hidden className="space-y-2 p-2 blur-sm select-none">
        <div className="h-3 w-4/5 rounded-full bg-neutral-500" />
        <div className="h-2.5 w-3/5 rounded-full bg-neutral-600" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/25">
        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-950/85 px-2 py-1 text-xs font-semibold text-neutral-300 shadow-sm">
          <IconLock aria-hidden className="size-3.5" />
          Members only
        </span>
      </div>
    </div>
  );
}

function PreviewWorkout({
  workout,
}: {
  workout: Extract<LabPreviewWorkout, { isPreview: true }>;
}) {
  return (
    <div className="rounded-xl bg-lime-300/10 p-1 ring-1 ring-lime-300/50 transition-shadow duration-150 hover:ring-lime-300">
      <Block workout={workout.workout} />
    </div>
  );
}

export function LabWeekPreview({
  previewWeek,
}: {
  previewWeek: LabPreviewWeek;
}) {
  const weekStart = parseQueryDate(previewWeek.weekStart);

  if (!weekStart) {
    return null;
  }

  const weekDays = getWeekDays(weekStart);
  const workoutsByDay = previewWeek.workouts.reduce<
    Record<string, LabPreviewWorkout[]>
  >((workouts, workout) => {
    workouts[workout.workoutDate] ??= [];
    workouts[workout.workoutDate].push(workout);
    return workouts;
  }, {});
  const previewWorkoutWithTrainingBlock = previewWeek.workouts.find(
    (workout): workout is Extract<LabPreviewWorkout, { isPreview: true }> =>
      workout.isPreview && Boolean(workout.workout.trainingBlock),
  );
  const trainingBlockTitle =
    previewWorkoutWithTrainingBlock?.workout.trainingBlock?.title;
  const previewLabel = `${previewWeek.previewWorkoutCount} ${
    previewWeek.previewWorkoutCount === 1 ? "workout" : "workouts"
  } unlocked. Select a highlighted card.`;

  return (
    <div className="mt-12 overflow-hidden rounded-3xl border border-lime-300/15 bg-neutral-950 shadow-2xl shadow-black/30">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <div>
          <p className="text-sm font-bold text-white">Training schedule</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {formatWeekRangeLabel(weekStart, true)}
            {trainingBlockTitle ? ` · ${trainingBlockTitle}` : null}
          </p>
        </div>
        <div className="flex max-w-sm items-center gap-2 rounded-xl bg-lime-300/10 px-3 py-2 text-xs font-semibold text-lime-300">
          <IconHandClick aria-hidden className="size-4 shrink-0 stroke-2" />
          {previewLabel}
        </div>
      </div>

      <div className="bg-neutral-900/70 p-3 sm:p-4">
        <div className="marketing-slider -mx-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-2 sm:-mx-4 sm:px-4 lg:mx-0 lg:grid lg:grid-cols-7 lg:px-0 lg:pb-0">
          {weekDays.map((day) => {
            const dayString = formatQueryDate(day);
            const dayWorkouts = workoutsByDay[dayString] ?? [];
            const hasPreviewWorkout = dayWorkouts.some(
              (workout) => workout.isPreview,
            );

            return (
              <article
                className="flex min-h-56 w-36 shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 p-2 lg:w-auto lg:min-w-0"
                key={dayString}
              >
                <div className="mb-3 flex items-start justify-between px-1 pt-0.5">
                  <div>
                    <p className="text-xs font-bold text-neutral-500">
                      {day
                        .toLocaleString("en-US", { weekday: "short" })
                        .toUpperCase()}
                    </p>
                    <p className="mt-1 text-lg font-bold text-neutral-200 tabular-nums">
                      {day.getDate()}
                    </p>
                  </div>
                  {hasPreviewWorkout ? (
                    <span className="mt-0.5 size-1.5 rounded-full bg-lime-300 shadow-sm shadow-lime-300/50" />
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  {dayWorkouts.map((workout) =>
                    workout.isPreview ? (
                      <PreviewWorkout key={workout.id} workout={workout} />
                    ) : (
                      <LockedWorkout key={workout.id} />
                    ),
                  )}

                  {dayWorkouts.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center pb-8 text-center text-xs font-semibold text-neutral-600">
                      No workout logged
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-2 px-1 text-xs font-medium text-neutral-500 lg:hidden">
          Swipe or scroll to explore the full week.
        </p>
      </div>
    </div>
  );
}
