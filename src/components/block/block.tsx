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
  "Aerobic Cross Training": "bg-[#0f54fa]",
  "Aerobic Run": "bg-[#0f5439]",
  "Bad Heart Rate Data": "bg-[#839288]",
  "Muscular Endurance": "bg-[#fa0f4d]",
  "Quality Cross Training": "bg-[#0f54fa]",
  "Quality HYROX": "bg-[#f57808]",
  "Quality Running": "bg-[#f5a61f]",
  Race: "bg-[#fa0f4d]",
  Sleds: "bg-[#0f54fa]",
  Strength: "bg-[#f57808]",
};

function getBlockAccentClass(tag: string | undefined) {
  if (!tag) return "bg-[#6ee542]";
  return BLOCK_ACCENT_CLASS_BY_TAG[tag] ?? "bg-[#6ee542]";
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
        "group/block relative h-[52px] w-full cursor-pointer gap-0 overflow-hidden rounded-[7px] bg-[#0a0f0c] py-0 text-[#ecf1e9] ring-1 ring-[#141d19] transition-[background-color,box-shadow,transform] duration-150 sm:hover:-translate-y-px sm:hover:bg-[#0c120f] sm:hover:ring-[#1d2721]",
      )}
      {...props}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-y-[-1px] left-[-1px] w-[3px] rounded-[2px]",
          accentClass,
        )}
      />
      <CardContent className="flex h-[52px] min-w-0 flex-col items-start gap-[6px] px-[9px] py-[7px] text-left">
        <CardTitle className="max-w-full truncate text-[12px] leading-[15px] font-semibold text-[#ecf1e9]">
          {workout.title}
        </CardTitle>
        <span className="max-w-full truncate text-[11px] leading-[14px] font-normal tabular-nums text-[#839288]">
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
              <span className="text-left leading-snug">{workout.title}</span>
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
              <span className="text-left leading-snug">{workout.title}</span>
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
