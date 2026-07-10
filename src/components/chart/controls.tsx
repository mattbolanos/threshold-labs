"use client";

import { useChartState } from "@/hooks/use-chart-state";
import { DateFilter } from "./date-filter";

export function ChartControls() {
  const { range, setRange } = useChartState();

  return <DateFilter range={range} setRange={setRange} />;
}
