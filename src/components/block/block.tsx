"use client";

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
import { TagBadge } from "@/components/workouts/tag-badge";
import { TAG_CONFIG, type TagConfig } from "@/components/workouts/tag-config";
import { cn, formatMinutesToTime } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";
import { CircularProgress } from "../ui/circular-progress";
import { BlockContent } from "./block-content";

interface BlockProps {
  workout: Doc<"workouts">;
  tagConfig?: TagConfig | undefined;
  className?: string;
}

const BaseCard = ({ workout, tagConfig, className }: BlockProps) => (
  <Card
    className={cn(
      className,
      "sm:hover:bg-muted/80 w-full cursor-pointer overflow-hidden",
    )}
  >
    <CardContent className="flex flex-col items-start gap-3 text-left">
      <CardTitle className="flex min-w-0 items-center gap-1.5">
        {tagConfig?.icon && (
          <tagConfig.icon
            className={cn(
              "stroke-2.5 size-5 shrink-0 self-start",
              tagConfig.iconColor,
            )}
          />
        )}
        <span className="leading-snug font-medium lg:text-[15px]">
          {workout.title}
        </span>
      </CardTitle>
      <div className="flex items-center gap-1">
        <span className="text-sm tabular-nums">
          {formatMinutesToTime(workout.trainingMinutes)}
        </span>
        <CircularProgress
          showLabel
          size={28}
          strokeWidth={3}
          value={workout.rpe}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {workout.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>
    </CardContent>
  </Card>
);

export function Block({ workout, className }: BlockProps) {
  const Content = () => <BlockContent workout={workout} />;
  const tagConfig = TAG_CONFIG.find((t) => t.tag === workout.tags[0]);

  const CardTrigger = () => (
    <BaseCard className={className} tagConfig={tagConfig} workout={workout} />
  );

  return (
    <>
      <Dialog>
        <DialogTrigger className="hidden w-full sm:inline-flex">
          <CardTrigger />
        </DialogTrigger>
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
              <span className="text-left leading-snug">{workout.title}</span>
            </DialogTitle>
          </DialogHeader>
          <Content />
        </DialogContent>
      </Dialog>
      <Drawer>
        <DrawerTrigger className="inline-flex w-full sm:hidden">
          <CardTrigger />
        </DrawerTrigger>
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
              <span className="text-left leading-snug">{workout.title}</span>
            </DrawerTitle>
          </DrawerHeader>
          <Content />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button size="lg">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
