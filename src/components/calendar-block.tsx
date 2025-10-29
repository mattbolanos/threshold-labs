"use client";

import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatMinutesToTime } from "@/lib/utils";
import type { WorkoutsOutput } from "@/server/api/types";

interface CalendarBlockProps {
  workout: WorkoutsOutput[number];
  className?: string;
}

export function CalendarBlock({ workout, className }: CalendarBlockProps) {
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
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="text-muted-foreground">{workout.workoutType}</div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Date */}
            <div className="text-muted-foreground text-sm">
              {workout.workoutDate}
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-semibold uppercase">
                Duration
              </p>
              <p className="text-lg font-semibold">
                {formatMinutesToTime(workout.trainingMinutes)}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-semibold uppercase">
                  RPE
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{workout.rpe}</span>
                  <CircularProgress
                    size={32}
                    strokeWidth={3}
                    value={workout.rpe}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-semibold uppercase">
                  STL
                </p>
                <p className="text-lg font-semibold">
                  {workout.subjectiveTrainingLoad.toFixed(1)}
                </p>
              </div>
            </div>

            {/* Description */}
            {workout.notes && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-semibold uppercase">
                  Description
                </p>
                <p className="text-foreground text-sm">{workout.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
