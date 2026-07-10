"use client";

import { useQuery } from "convex/react";
import { addDays } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { calculateSTL, formatQueryDate } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";

type Workout = Doc<"workouts">;

const CARDIO_TAGS = new Set([
  "Aerobic Cross Training",
  "Aerobic Run",
  "Bad Heart Rate Data",
  "Quality Cross Training",
  "Quality HYROX",
  "Quality Running",
  "Race",
  "Sleds",
]);

const oneDecimalFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

function isCardioWorkout(workout: Workout) {
  const hasDistance =
    (workout.totalRunMiles ?? 0) > 0 ||
    (workout.totalBikeMiles ?? 0) > 0 ||
    (workout.totalSkiKs ?? 0) > 0 ||
    (workout.totalRowKs ?? 0) > 0;

  return hasDistance || workout.tags.some((tag) => CARDIO_TAGS.has(tag));
}

function StatRow({
  label,
  unit,
  value,
}: {
  label: string;
  unit?: string;
  value: number;
}) {
  return (
    <div className="flex min-h-10 items-center justify-between border-b border-border/60 py-2 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="font-semibold tabular-nums">
          {oneDecimalFormatter.format(value)}
        </span>
        {unit ? (
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function MobileWeekSummarySkeleton() {
  return (
    <Card className="mb-4 gap-0 rounded-lg bg-muted/40 py-0 lg:hidden">
      <CardContent className="px-3">
        <Accordion>
          <AccordionItem className="border-b-0" value="weekly-summary">
            <AccordionTrigger className="min-h-16 items-center py-3">
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3 pr-3">
                <div className="min-w-0">
                  <p className="font-bold">Weekly Summary</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent></AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export function MobileWeekSummary() {
  const { weekStartDate } = useCalendarNav();
  const workouts = useQuery(api.workouts.getWorkouts, {
    from: formatQueryDate(weekStartDate),
    to: formatQueryDate(addDays(weekStartDate, 6)),
  });

  if (!workouts) return <MobileWeekSummarySkeleton />;

  const totalTrainingMinutes = workouts.reduce(
    (sum, workout) => sum + (workout.trainingMinutes || 0),
    0,
  );
  const totalRunMiles = workouts.reduce(
    (sum, workout) => sum + (workout.totalRunMiles || 0),
    0,
  );
  const totalCardioMinutes = workouts.reduce(
    (sum, workout) =>
      isCardioWorkout(workout) ? sum + (workout.trainingMinutes || 0) : sum,
    0,
  );
  const totalSubjectiveTrainingLoad = workouts.reduce(
    (sum, workout) =>
      sum +
      calculateSTL(
        workout.rpe,
        workout.trainingMinutes,
        workout.totalRunMiles ?? null,
      ),
    0,
  );

  return (
    <Card className="mb-4 gap-0 rounded-lg bg-muted/40 py-0 lg:hidden">
      <CardContent className="px-3">
        <Accordion>
          <AccordionItem className="border-b-0" value="weekly-summary">
            <AccordionTrigger
              className="min-h-16 items-center py-3 hover:no-underline"
              disabled={workouts.length === 0}
            >
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3 pr-3">
                <div className="min-w-0">
                  <p className="font-bold">Weekly Summary</p>
                </div>
                <p className="font-normal text-muted-foreground tabular-nums">
                  {workouts.length}{" "}
                  {workouts.length === 1 ? "workout" : "workouts"}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="pt-2">
                <p className="mb-1 text-xs font-bold tracking-widest uppercase">
                  Training
                </p>
                <StatRow
                  label="True Training Hours"
                  unit="hrs"
                  value={totalTrainingMinutes / 60}
                />
                <StatRow
                  label="Subjective Training Load"
                  value={totalSubjectiveTrainingLoad}
                />
              </div>
              <div className="pt-4">
                <p className="mb-1 text-xs font-bold tracking-widest uppercase">
                  Cardio
                </p>
                <StatRow label="Run Miles" unit="mi" value={totalRunMiles} />
                <StatRow
                  label="Cardio Hours"
                  unit="hrs"
                  value={totalCardioMinutes / 60}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
