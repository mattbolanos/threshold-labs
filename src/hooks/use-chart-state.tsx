"use client";

import { parseAsJson, useQueryState } from "nuqs";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { z } from "zod";

const dateRangeSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

type DateRange = z.infer<typeof dateRangeSchema>;
type SetRange = ReturnType<typeof useQueryState<DateRange>>[1];

const ChartRangeContext = createContext<DateRange | null | undefined>(
  undefined,
);
const SetChartRangeContext = createContext<SetRange | undefined>(undefined);

export function ChartStateProvider({ children }: { children: ReactNode }) {
  const [range, setRange] = useQueryState(
    "range",
    parseAsJson(dateRangeSchema),
  );
  const hasRange = range !== null;
  const from = range?.from;
  const to = range?.to;
  const stableRange = useMemo(
    () => (hasRange ? { from, to } : null),
    [hasRange, from, to],
  );

  return (
    <SetChartRangeContext.Provider value={setRange}>
      <ChartRangeContext.Provider value={stableRange}>
        {children}
      </ChartRangeContext.Provider>
    </SetChartRangeContext.Provider>
  );
}

export function useChartRange() {
  const range = useContext(ChartRangeContext);

  if (range === undefined) {
    throw new Error("useChartRange must be used within ChartStateProvider");
  }

  return range;
}

export function useChartState() {
  const range = useChartRange();
  const setRange = useContext(SetChartRangeContext);

  if (!setRange) {
    throw new Error("useChartState must be used within ChartStateProvider");
  }

  return {
    range,
    setRange,
  };
}
