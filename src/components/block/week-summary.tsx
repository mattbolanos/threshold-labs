import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { calculateSTL, cn } from "@/lib/utils";
import type { WorkoutsOutput } from "@/server/api/types";

interface WeekSummaryProps {
  workouts: WorkoutsOutput;
  className?: string;
}

function StatRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | string;
  unit?: string;
}) {
  return (
    <div className="border-border flex items-center justify-between border-b py-2 last:border-b-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="font-semibold tabular-nums">{value}</span>
        {unit && <span className="text-muted-foreground text-xs">{unit}</span>}
      </div>
    </div>
  );
}

export function WeekSummary({ workouts, className }: WeekSummaryProps) {
  const totalWorkouts = workouts.length;
  const totalTrainingMinutes = workouts.reduce(
    (sum, w) => sum + (w.trainingMinutes || 0),
    0,
  );
  const totalRunMiles = workouts.reduce(
    (sum, w) => sum + (w.totalRunMiles || 0),
    0,
  );
  const totalBikeMiles = workouts.reduce(
    (sum, w) => sum + (w.totalBikeMiles || 0),
    0,
  );
  const totalSkiKs = workouts.reduce((sum, w) => sum + (w.totalSkiKs || 0), 0);
  const totalRowKs = workouts.reduce((sum, w) => sum + (w.totalRowKs || 0), 0);
  const totalSubjectiveTrainingLoad = workouts.reduce(
    (sum, w) => sum + calculateSTL(w.rpe, w.trainingMinutes, w.totalRunMiles),
    0,
  );

  const hasRunning = totalRunMiles > 0;
  const hasBiking = totalBikeMiles > 0;
  const hasRowing = totalRowKs > 0;
  const hasSkiing = totalSkiKs > 0;

  return (
    <Card className={cn(className, "bg-muted/50 py-0")}>
      <CardContent>
        <Accordion collapsible type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger
              className="hover:no-underline"
              disabled={totalWorkouts === 0}
            >
              <div className="flex flex-1 items-center justify-between pr-2 text-left">
                <span>Week Summary</span>
                <span className="text-muted-foreground tabular-nums">
                  {totalWorkouts}{" "}
                  {workouts.length === 1 ? "workout" : "workouts"}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-4">
              <div className="space-y-0">
                <h4 className="mb-2 text-xs font-semibold tracking-wide uppercase">
                  Overview
                </h4>
                <StatRow label="Total Workouts" value={totalWorkouts} />
                <StatRow
                  label="Training Time"
                  unit="hrs"
                  value={(totalTrainingMinutes / 60).toFixed(1)}
                />
                <StatRow
                  label="Total Subjective Load"
                  value={totalSubjectiveTrainingLoad.toFixed(1)}
                />
              </div>

              {(hasRunning || hasBiking || hasRowing) && (
                <div className="space-y-0 pt-2">
                  <h4 className="mb-2 text-xs font-semibold tracking-wide uppercase">
                    Activity
                  </h4>
                  {hasRunning && (
                    <StatRow
                      label="Running"
                      unit="mi"
                      value={totalRunMiles.toFixed(1)}
                    />
                  )}
                  {hasBiking && (
                    <StatRow
                      label="Biking"
                      unit="mi"
                      value={totalBikeMiles.toFixed(1)}
                    />
                  )}
                  {hasRowing && (
                    <StatRow
                      label="Rowing"
                      unit="km"
                      value={totalRowKs.toFixed(1)}
                    />
                  )}
                  {hasSkiing && (
                    <StatRow
                      label="Skiing"
                      unit="km"
                      value={totalSkiKs.toFixed(1)}
                    />
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
