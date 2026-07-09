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
import { TAG_CONFIG, type TagConfig } from "@/components/workouts/tag-config";
import { cn } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";
import { BlockContent } from "./block-content";

interface BlockProps {
  workout: Doc<"workouts">;
  tagConfig?: TagConfig | undefined;
  className?: string;
}

const BLOCK_ACCENT_CLASS_BY_TAG: Record<string, string> = {
  "Aerobic Cross Training": "bg-chart-3",
  "Aerobic Run": "bg-chart-1",
  "Bad Heart Rate Data": "bg-muted-foreground",
  "Muscular Endurance": "bg-chart-5",
  "Quality Cross Training": "bg-chart-3",
  "Quality HYROX": "bg-chart-4",
  "Quality Running": "bg-chart-2",
  Race: "bg-chart-5",
  Sleds: "bg-chart-3",
  Strength: "bg-chart-4",
};

function getBlockAccentClass(tag: string | undefined) {
  if (!tag) return "bg-primary";
  return BLOCK_ACCENT_CLASS_BY_TAG[tag] ?? "bg-primary";
}

function formatBlockDuration(minutes: number) {
  const roundedMinutes = Math.round(minutes);
  const hours = Math.floor(roundedMinutes / 60);
  const mins = roundedMinutes % 60;

  return `${hours}:${mins.toString().padStart(2, "0")}`;
}

const BaseCard = ({
  workout,
  tagConfig,
  className,
  ...props
}: BlockProps & React.ComponentProps<"div">) => {
  const accentClass = getBlockAccentClass(tagConfig?.tag ?? workout.tags[0]);

  return (
    <Card
      aria-label={`${workout.title}, ${formatBlockDuration(
        workout.trainingMinutes,
      )}, RPE ${workout.rpe}`}
      className={cn(
        className,
        "group/block bg-card text-card-foreground ring-border sm:hover:bg-accent sm:hover:ring-border relative h-13 w-full cursor-pointer gap-0 overflow-hidden rounded-lg py-0 ring-1 transition-all duration-150 sm:hover:-translate-y-px",
      )}
      {...props}
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-y-px -left-px w-1 rounded-xs",
          accentClass,
        )}
      />
      <CardContent className="flex h-13 min-w-0 flex-col items-start gap-1.5 px-2 py-2 text-left">
        <CardTitle className="max-w-full truncate text-xs font-semibold">
          {workout.title}
        </CardTitle>
        <span className="text-muted-foreground max-w-full truncate text-xs font-normal tabular-nums">
          {formatBlockDuration(workout.trainingMinutes)} - RPE {workout.rpe}
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
              tagConfig={tagConfig}
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
          <BlockContent workout={workout} />
        </DialogContent>
      </Dialog>
      <Drawer>
        <DrawerTrigger
          nativeButton={false}
          render={
            <BaseCard
              className={cn(className, "inline-flex w-full sm:hidden")}
              tagConfig={tagConfig}
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
