import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn, formatMinutesToTime } from "@/lib/utils";
import type { WorkoutsOutput } from "@/server/api/types";

interface CalendarBlockProps {
  workout: WorkoutsOutput[number];
  className?: string;
}

export function CalendarBlock({ workout, className }: CalendarBlockProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex flex-col gap-3">
        <CardTitle className="flex items-start gap-2 pb-1">
          <span className="text-[15px] leading-snug">
            {workout.workoutType}
          </span>
        </CardTitle>
        <span className="text-sm tabular-nums">
          {formatMinutesToTime(workout.trainingMinutes)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm tabular-nums">{workout.rpe} RPE</span>

          <CircularProgress size={24} strokeWidth={3} value={workout.rpe} />
        </div>
        <span className="text-sm tabular-nums">
          {workout.subjectiveTrainingLoad.toFixed(1)} STL
        </span>
      </CardContent>
    </Card>
  );
}
