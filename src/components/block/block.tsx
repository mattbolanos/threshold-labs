"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn, formatMinutesToTime } from "@/lib/utils";
import type { WorkoutsOutput } from "@/server/api/types";
import { BlockContent } from "./block-content";

interface BlockProps {
  workout: WorkoutsOutput[number];
  className?: string;
}

const BaseCard = ({ workout, className }: BlockProps) => (
  <Card className={cn(className, "sm:hover:bg-muted/80 w-full cursor-pointer")}>
    <CardContent className="flex flex-col items-start gap-3 text-left">
      <CardTitle className="flex min-w-0 items-start gap-2 pb-1">
        <span className="line-clamp-2 text-[15px] leading-snug lg:line-clamp-none">
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

export function Block({ workout, className }: BlockProps) {
  const Content = () => <BlockContent workout={workout} />;
  const CardTrigger = () => (
    <BaseCard className={className} workout={workout} />
  );

  return (
    <>
      <Dialog>
        <DialogTrigger className="hidden sm:inline-flex">
          <CardTrigger />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{workout.workoutType}</DialogTitle>
          </DialogHeader>
          <Content />
        </DialogContent>
      </Dialog>
      <Drawer>
        <DrawerTrigger className="inline-flex sm:hidden">
          <CardTrigger />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{workout.workoutType}</DrawerTitle>
          </DrawerHeader>
          <Content />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button>Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
