import { WORKOUT_TYPES } from "@/app/constants";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn, formatMinutesToTime } from "@/lib/utils";

interface CalendarBlockProps {
  className?: string;
}

export function CalendarBlock({ className }: CalendarBlockProps) {
  const rpe = Math.floor(Math.random() * 9) + 2;
  const time = Math.floor(Math.random() * 100) + 30;
  const stl = rpe * (time / 10);
  const workoutType =
    WORKOUT_TYPES[Math.floor(Math.random() * WORKOUT_TYPES.length)];

  return (
    <Card className={cn(className)}>
      <CardContent className="flex flex-col gap-3">
        <CardTitle className="flex items-start gap-2 pb-1">
          <workoutType.icon className="float-start size-5 shrink-0" />
          <span className="text-[15px] leading-snug">{workoutType.title}</span>
        </CardTitle>
        <span className="text-sm tabular-nums">
          {formatMinutesToTime(time)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm tabular-nums">{rpe} RPE</span>

          <CircularProgress size={24} strokeWidth={3} value={rpe} />
        </div>
        <span className="text-sm tabular-nums">{stl.toFixed(1)} STL</span>
      </CardContent>
    </Card>
  );
}
