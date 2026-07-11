"use client";

import { Progress } from "@/components/ui/progress";
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
  if (isLoading) {
    return (
      <Skeleton className="h-1.5 w-1/3 rounded-full motion-reduce:animate-none" />
    );
  }

  const loadPercentage =
    maxWeeklyDailyLoad > 0
      ? Math.min(100, Math.max(0, (dailyLoad / maxWeeklyDailyLoad) * 100))
      : 0;

  return (
    <Progress
      aria-label={`Daily training load: ${Math.round(dailyLoad)}`}
      className="w-1/3"
      value={loadPercentage}
    />
  );
}
