"use client";

import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
import {
  getTagAccentOverflowCount,
  TagAccentMarker,
} from "@/components/workouts/tag-accent-marker";
import { TAG_CONFIG } from "@/components/workouts/tag-config";
import type { WorkoutWithTrainingBlock } from "@/lib/training-blocks";
import { cn } from "@/lib/utils";
import { BlockContent } from "./block-content";

interface BlockProps {
  workout: WorkoutWithTrainingBlock;
  className?: string;
}

function formatBlockDuration(minutes: number) {
  const roundedMinutes = Math.round(minutes);
  const hours = Math.floor(roundedMinutes / 60);
  const mins = roundedMinutes % 60;

  return `${hours}:${mins.toString().padStart(2, "0")}`;
}

const BaseCard = ({
  workout,
  className,
  ...props
}: BlockProps & React.ComponentProps<"div">) => {
  const tagOverflowCount = getTagAccentOverflowCount(workout.tags);
  const tagLabel =
    workout.tags.length > 0 ? workout.tags.join(", ") : "No tags";

  return (
    <Card
      aria-label={`${workout.title}, ${formatBlockDuration(
        workout.trainingMinutes,
      )}, RPE ${workout.rpe}, tags: ${tagLabel}`}
      className={cn(
        className,
        "group/block relative min-h-16 w-full cursor-pointer gap-0 overflow-hidden rounded-lg bg-card py-0 text-card-foreground ring-1 ring-border transition-all duration-150 sm:hover:-translate-y-px sm:hover:bg-accent sm:hover:ring-border",
      )}
      title={tagLabel}
      {...props}
    >
      <TagAccentMarker tags={workout.tags} />
      <CardContent className="flex min-h-16 min-w-0 flex-col items-start gap-1.5 px-2 py-2 text-left">
        <CardTitle className="flex w-full min-w-0 items-start gap-1.5 text-xs leading-tight font-semibold">
          <span className="line-clamp-2 min-w-0 flex-1">{workout.title}</span>
          {tagOverflowCount > 0 && (
            <span
              aria-hidden
              className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums"
            >
              +{tagOverflowCount}
            </span>
          )}
        </CardTitle>
        <span className="max-w-full truncate text-xs font-normal text-muted-foreground tabular-nums">
          {formatBlockDuration(workout.trainingMinutes)} • RPE {workout.rpe}
        </span>
      </CardContent>
    </Card>
  );
};

export function Block({ workout, className }: BlockProps) {
  const tagConfig = TAG_CONFIG.find((t) => t.tag === workout.tags[0]);

  return (
    <>
      <Dialog>
        <DialogTrigger
          nativeButton={false}
          render={
            <BaseCard
              className={cn(className, "hidden w-full sm:inline-flex")}
              workout={workout}
            />
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5">
              {tagConfig?.icon && (
                <tagConfig.icon
                  className={cn(
                    "stroke-2.5 size-6 shrink-0 self-start",
                    tagConfig.iconColor,
                  )}
                />
              )}
              <span className="text-left">{workout.title}</span>
            </DialogTitle>
          </DialogHeader>

          <BlockContent
            className="no-scrollbar -mx-4 max-h-[66vh] overflow-y-auto px-4"
            workout={workout}
          />
        </DialogContent>
      </Dialog>
      <Drawer showSwipeHandle>
        <DrawerTrigger
          nativeButton={false}
          render={
            <BaseCard
              className={cn(className, "inline-flex w-full sm:hidden")}
              workout={workout}
            />
          }
        />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-1.5">
              {tagConfig?.icon && (
                <tagConfig.icon
                  className={cn(
                    "stroke-2.5 size-5.5 shrink-0 self-start",
                    tagConfig.iconColor,
                  )}
                />
              )}
              <span className="text-left">{workout.title}</span>
            </DrawerTitle>
          </DrawerHeader>
          <BlockContent
            className="no-scrollbar max-h-[80vh] overflow-y-auto p-2.5"
            workout={workout}
          />
          <DrawerFooter>
            <DrawerClose render={<Button size="lg" />}>Close</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
