"use client";

import { m, useReducedMotion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyLoadBarProps {
  dailyLoad: number;
  isLoading: boolean;
  maxWeeklyDailyLoad: number;
}

export function DailyLoadBar({
  dailyLoad,
  isLoading,
  maxWeeklyDailyLoad,
}: DailyLoadBarProps) {
  const shouldReduceMotion = useReducedMotion();

  if (isLoading) {
    return (
      <Skeleton className="h-1.5 w-1/3 rounded-full motion-reduce:animate-none" />
    );
  }

  const loadPercentage =
    maxWeeklyDailyLoad > 0
      ? Math.min(100, Math.max(0, (dailyLoad / maxWeeklyDailyLoad) * 100))
      : 0;
  const scale = loadPercentage / 100;

  return (
    <div
      aria-label={`Daily training load: ${Math.round(dailyLoad)}`}
      aria-valuemax={Math.round(maxWeeklyDailyLoad)}
      aria-valuemin={0}
      aria-valuenow={Math.round(dailyLoad)}
      className="h-1.5 w-1/3 overflow-hidden rounded-full bg-muted"
      role="progressbar"
    >
      <m.div
        animate={{ transform: `scaleX(${scale})` }}
        className="h-full origin-left rounded-full bg-primary will-change-transform"
        initial={shouldReduceMotion ? false : { transform: "scaleX(0.02)" }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { bounce: 0, duration: 0.24, type: "spring" }
        }
      />
    </div>
  );
}
