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
import { cn } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";
import { BlockContent } from "./block-content";

interface BlockProps {
  workout: Doc<"workouts">;
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
        "group/block relative h-13 w-full cursor-pointer gap-0 overflow-hidden rounded-lg bg-card py-0 text-card-foreground ring-1 ring-border transition-all duration-150 sm:hover:-translate-y-px sm:hover:bg-accent sm:hover:ring-border",
      )}
      title={tagLabel}
      {...props}
    >
      <TagAccentMarker tags={workout.tags} />
      <CardContent className="flex h-13 min-w-0 flex-col items-start gap-1.5 px-2 py-2 text-left">
        <CardTitle className="flex w-full min-w-0 items-center gap-1.5 text-xs font-semibold">
          <span className="min-w-0 flex-1 truncate">{workout.title}</span>
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
          <BlockContent className="max-h-[70svh]" workout={workout} />
        </DialogContent>
      </Dialog>
      <Drawer>
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
          <BlockContent workout={workout} />
          <DrawerFooter>
            <DrawerClose render={<Button size="lg" />}>Close</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
