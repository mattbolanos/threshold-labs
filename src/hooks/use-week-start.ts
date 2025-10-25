"use client";

import { parseAsIsoDate, useQueryState } from "nuqs";
import { startOfWeek } from "@/lib/utils";

export function useWeekStart() {
  const [weekStart, setWeekStart] = useQueryState(
    "weekStart",
    parseAsIsoDate.withDefault(startOfWeek(new Date())),
  );

  return { setWeekStart, weekStart };
}
