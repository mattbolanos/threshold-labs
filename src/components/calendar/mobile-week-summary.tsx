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
import { formatOneDecimal, formatQueryDate } from "@/lib/utils";
import { getWeekSummary } from "@/lib/workout-summary";
import { api } from "../../../convex/_generated/api";

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
          {formatOneDecimal(value)}
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

  const summary = getWeekSummary(workouts);

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
                  value={summary.trainingHours}
                />
                <StatRow
                  label="Subjective Training Load"
                  value={summary.subjectiveLoad}
                />
              </div>
              <div className="pt-4">
                <p className="mb-1 text-xs font-bold tracking-widest uppercase">
                  Cardio
                </p>
                <StatRow label="Run Miles" unit="mi" value={summary.runMiles} />
                <StatRow
                  label="Cardio Hours"
                  unit="hrs"
                  value={summary.cardioHours}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
