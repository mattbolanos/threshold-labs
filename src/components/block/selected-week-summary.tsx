"use client";

import { useQuery } from "convex/react";
import { addDays } from "date-fns";
import { WeekSummary } from "@/components/block/week-summary";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { formatQueryDate } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";

interface SelectedWeekSummaryProps {
  className?: string;
}

export function SelectedWeekSummary({ className }: SelectedWeekSummaryProps) {
  const { weekStartDate } = useCalendarNav();
  const workouts = useQuery(api.workouts.getWorkouts, {
    from: formatQueryDate(weekStartDate),
    to: formatQueryDate(addDays(weekStartDate, 6)),
  });

  return <WeekSummary className={className} workouts={workouts} />;
}
