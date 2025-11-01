"use client";

import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn, formatMinutesToTime } from "@/lib/utils";
import type { WorkoutsOutput } from "@/server/api/types";
import { BlockDialog } from "./dialog-content";

interface BlockProps {
  workout: WorkoutsOutput[number];
  className?: string;
}

export function Block({ workout, className }: BlockProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className={cn(className, "hover:bg-muted/80 cursor-pointer")}
        onMouseDown={() => setOpen(true)}
      >
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
      <BlockDialog onOpenChange={setOpen} open={open} workout={workout} />
    </>
  );
}
